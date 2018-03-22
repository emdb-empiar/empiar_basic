// Check whether the path points to a supported image file format or not
// @param filepath: path to the file
function isImageFile(filepath) {
	return ( filepath.endsWith(".mrc") || filepath.endsWith(".mrcs") || filepath.endsWith(".dm4") || filepath.endsWith(".tif") || filepath.endsWith(".hed") || filepath.endsWith(".img") || filepath.endsWith(".tbz") || filepath.endsWith(".dat") || filepath.endsWith(".st") || filepath.endsWith(".raw") );
}


// Check whether the path points to a supported text file format or not
// @param filepath: path to the file
function isTextFile(filepath) {
	return ( filepath.endsWith(".emx") || filepath.endsWith(".txt") );
}


// Check whether the path points to a supported file format or not
// @param filepath: path to the file
function isReadableFile(filepath) {
	return ( isImageFile(filepath) || isTextFile(filepath) );
}
