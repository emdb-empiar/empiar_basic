function makeToolTip(text, context){
        var height = Math.round( (text.length / 20) + 1); 
        document.write('<span id="'+context+'" class="icon icon-generic dark-icon" data-icon="?"></span>')
        new YAHOO.widget.Tooltip('dummy', {
            context: context,
            width: '20em',
            //height: height.toString() + "em",
            showdelay: 300,
            zIndex: 3,
            text: text
        });
}
