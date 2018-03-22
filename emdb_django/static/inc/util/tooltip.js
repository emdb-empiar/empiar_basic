function makeToolTip(text, context){
        var height = Math.round( (text.length / 20) + 1); 
        document.write('<img id="'+context+'" src="//www.ebi.ac.uk/pdbe/emdb/emdb_static/emsearch/images/question.png"></img>')
        new YAHOO.widget.Tooltip('dummy', {
            context: context,
            width: '20em',
            //height: height.toString() + "em",
            showdelay: 300,
            zIndex: 3,
            text: text
        });
}
