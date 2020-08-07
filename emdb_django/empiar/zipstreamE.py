#!/usr/bin/env python
import os
import struct
import time
import zipfile

from builtins import range

__all__ = ("ZipStream",)

# Zip constants
ZIP32_VERSION = 20
ZIP64_VERSION = 45
ZIP32_LIMIT = (1 << 31) - 1
UTF8_FLAG = 0x800  # utf-8 filename encoding flag

# File descriptor
LF_STRUCT = "<4s2B4HL2L2H"
LF_MAGIC = b"PK\003\004"

# File header
DD_STRUCT = "<4sLLL"
DD_STRUCT64 = "<4sLQQ"
DD_MAGIC = b"PK\x07\x08"

# Central directory file header
CDLF_STRUCT = "<4s4B4HL2L5H2L"
CDFH_MAGIC = b"PK\001\002"

# End of central directory record
CD_END_STRUCT64 = "<4sQ2H2L4Q"
CD_END_MAGIC64 = b"PK\x06\x06"
CDL_END_STRUCT64 = "<4sLQL"
CDL_END_MAGIC64 = b"PK\x06\x07"

CD_END_FINAL_STRUCT = b"<4s4H2LH"
CD_END_FINAL_MAGIC = b"PK\005\006"


class ZipStream(object):

    def __init__(self, chunksize=1024):
        self.__files = []
        self.chunksize = chunksize

        # Central directory placement
        self.__offset = 0

    def add_file(self, fname, newname=None):
        # Date and time of file last modification
        file_stats = os.stat(fname)
        mod_time = time.localtime(file_stats.st_mtime)
        date_time = mod_time[0:6]

        # File properties
        rec = {'src': fname,
               'file_size': file_stats.st_size,
               'date_time': date_time,
               'compress_type': zipfile.ZIP_STORED,  # Pack without compression
               'comment': b"",
               'extra': b"",
               'create_system': 3,  # Unix
               'create_version': ZIP32_VERSION,
               'version_needed': ZIP32_VERSION,
               'flag_bits': 0b00001000,  # flag about using data descriptor is always on
               'volume': 0,
               'internal_attr': 0,
               'external_attr': (file_stats[0] & 0xFFFF) << 16,
               'crc': 0,  # will be calculated during data streaming
               "offset": 0,  # file header offset in zip file
               }

        # File name in archive
        if newname:
            fname = newname
        else:
            fname = os.path.split(fname)[1]
        try:
            rec['file_name'] = fname.encode("ascii")
        except UnicodeError:
            rec['file_name'] = fname.encode("utf-8")
            rec['flag_bits'] |= UTF8_FLAG
        self.__files.append(rec)

    def make_local_file_header(self, idx):
        """
        Create file header
        """

        filename = self.__files[idx]['file_name']
        date_time = self.__files[idx]['date_time']
        self.__files[idx]['header_offset'] = self.__offset
        self.__files[idx]['compress_size'] = 0
        self.__files[idx]['file_size'] = file_size = 0

        # Yielding the header now
        dosdate = (date_time[0] - 1980) << 9 | date_time[1] << 5 | date_time[2]
        dostime = date_time[3] << 11 | date_time[4] << 5 | (date_time[5] // 2)

        extra = b""

        # If the file does not fit into 4 byte int, then use ZIP64
        if file_size > ZIP32_LIMIT:
            struct_format = '<HHQQ'
            extra = extra + struct.pack(struct_format, 1, struct.calcsize(struct_format) - 4, file_size,
                                        self.__files[idx]['compress_size'])
            file_size = 0xFFFFFFFF  # -1
            self.__files[idx]['compress_size'] = 0xFFFFFFFF  # -1
            self.__files[idx]['version_needed'] = max(ZIP64_VERSION, self.__files[idx]['version_needed'])
            self.__files[idx]['create_version'] = max(ZIP64_VERSION, self.__files[idx]['version_needed'])

        # ZIP requires the file header to have two bytes assigned for the version number, but since it fits into a
        # single byte (0x14 = 20), then
        # we store an empty byte beside it
        empty_byte = 0
        header = struct.pack(LF_STRUCT, LF_MAGIC, self.__files[idx]['version_needed'], empty_byte,
                             self.__files[idx]['flag_bits'],
                             self.__files[idx]['compress_type'], dostime, dosdate, self.__files[idx]['crc'],
                             self.__files[idx]['compress_size'], file_size, len(filename), len(extra))

        head = header + filename + extra

        self.__offset += len(head)

        self.__files[idx]['header'] = head

        return head

    def make_data_descriptor(self, idx):
        """
        Create file descriptor
        """

        if self.__files[idx]['file_size'] > ZIP32_LIMIT:
            struct_format = DD_STRUCT64
        else:
            struct_format = DD_STRUCT

        data = struct.pack(struct_format, DD_MAGIC, self.__files[idx]['crc'], self.__files[idx]['compress_size'],
                           self.__files[idx]['file_size'])
        self.__offset += len(data)

        return data

    def make_cd(self):
        """
        Make the central directory record
        """

        central_directory = []
        cd_head_offset = self.__offset
        for zipped_file in self.__files:
            date_time = zipped_file['date_time']
            dosdate = (date_time[0] - 1980) << 9 | date_time[1] << 5 | date_time[2]
            dostime = date_time[3] << 11 | date_time[4] << 5 | (date_time[5] // 2)
            extra_info = []
            if zipped_file['file_size'] > ZIP32_LIMIT:
                extra_info.append(zipped_file['file_size'])
                extra_info.append(zipped_file['compress_size'])
                # Set sizes to the maximum value for a 32-bit unsigned integer
                file_size = 0xFFFFFFFF
                compress_size = 0xFFFFFFFF
            else:
                file_size = zipped_file['file_size']
                compress_size = zipped_file['compress_size']

            if zipped_file['header_offset'] > ZIP32_LIMIT:
                extra_info.append(zipped_file['header_offset'])
                header_offset = 0xFFFFFFFF  # This has to be set for ZIP64 to read from the proper size field:
                # "If an archive is in ZIP64 format and the value in this field is 0xFFFFFFFF, the size will be in the
                # corresponding 8 byte zip64 end of central directory field."
            else:
                header_offset = zipped_file['header_offset']

            extra_central_directory = zipped_file['extra']
            if extra_info:
                # Append a ZIP64 field to the extra's
                extra_central_directory = struct.pack(
                    b'<HH' + b'Q' * len(extra_info),
                    1, 8 * len(extra_info), *extra_info) + extra_central_directory

                create_version = max(ZIP64_VERSION, zipped_file['create_version'])
            else:
                create_version = zipped_file['create_version']

            version_needed = 0
            disk_num_start = 0
            central_dir_header = struct.pack(CDLF_STRUCT, CDFH_MAGIC, create_version, zipped_file['create_system'],
                                             version_needed, version_needed,
                                             zipped_file['flag_bits'], zipped_file['compress_type'], dostime, dosdate,
                                             zipped_file['crc'],
                                             compress_size, file_size, len(zipped_file['file_name']),
                                             len(extra_central_directory), len(zipped_file['comment']),
                                             disk_num_start, zipped_file['internal_attr'], zipped_file['external_attr'],
                                             header_offset)

            self.__offset += len(central_dir_header)
            central_directory.append(central_dir_header)

            self.__offset += len(zipped_file['file_name'])
            central_directory.append(zipped_file['file_name'])

            self.__offset += len(extra_central_directory)
            central_directory.append(extra_central_directory)

            self.__offset += len(zipped_file['comment'])
            central_directory.append(zipped_file['comment'])

        cd_end_offset = self.__offset

        # Make end of central directory record
        cd_entries = len(self.__files)
        cd_size = cd_end_offset - cd_head_offset
        if cd_head_offset > ZIP32_LIMIT:
            # ZIP64 end central directory record
            # Size of ZIP64 EOCD   : 44 (0x2c) (Zip64 End Central Directory Record size)
            # Version Made by      : 45 (0x2d)
            #        (HI) Platform : 0 (External Attribute Compatibility)
            #        (LO) Version  : 45
            # Version needed       : 45 (0x2d)
            # NumDisk              : 0 (0x0)
            # NumDiskWithThisCD    : 0 (0x0)
            # Entries in this disk : cd_entries (0x2)
            zip64cd_end_rec = struct.pack(CD_END_STRUCT64, CD_END_MAGIC64, 44, ZIP64_VERSION, ZIP64_VERSION, 0, 0,
                                          cd_entries, cd_entries,
                                          cd_end_offset - cd_head_offset, cd_head_offset)
            self.__offset += len(zip64cd_end_rec)
            central_directory.append(zip64cd_end_rec)

            # NumDisk              : 0 (0x0)
            # RelativeOffset       : cd_end_offset (Offset to Zip64 EOCD)
            # Total disks          : 1 (0x1)
            zip64_cd_locator = struct.pack(CDL_END_STRUCT64, CDL_END_MAGIC64, 0, cd_end_offset, 1)
            self.__offset += len(zip64_cd_locator)
            central_directory.append(zip64_cd_locator)

            cd_entries = min(cd_entries, 0xFFFF)
            cd_size = min(cd_size, 0xFFFFFFFF)
            cd_head_offset = min(cd_head_offset, 0xFFFFFFFF)
        else:
            cd_size = cd_end_offset - cd_head_offset

        # Final end of central directory record
        cd_end_rec = struct.pack(CD_END_FINAL_STRUCT, CD_END_FINAL_MAGIC, 0, 0, cd_entries, cd_entries, cd_size,
                                 cd_head_offset, 0)
        self.__offset += len(cd_end_rec)
        central_directory.append(cd_end_rec)
        data_bytes = b"".join(central_directory)
        return data_bytes

    # Stream single zip file with header and descriptor
    def stream_single_file(self, idx):
        # File header
        yield self.make_local_file_header(idx)

        # File content
        crc = 0
        file_size = 0
        with open(self.__files[idx]['src'], 'rb') as fh:
            while 1:
                part = fh.read(self.chunksize)
                if not part:
                    break
                file_size = file_size + len(part)
                self.__offset += len(part)
                yield part
                crc = zipfile.crc32(part, crc) & 0xFFFFFFFF

        if not crc:
            crc = 0
        self.__files[idx]['crc'] = crc
        self.__files[idx]['file_size'] = self.__files[idx]['compress_size'] = file_size

        # File descriptor
        yield self.make_data_descriptor(idx)

    # Stream archive
    def stream(self):
        for idx in range(len(self.__files)):
            for data in self.stream_single_file(idx):
                yield data

        for data in self.make_cd():
            yield bytes([data])
