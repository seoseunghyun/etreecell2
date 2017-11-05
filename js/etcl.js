(function() {
    var etreecell = function(canvasId) {
        Log('Initialize etreecell canvas.');
        this.canvasDom = document.getElementById(canvasId);
        this.cellArr = [];
        this.linkArr = [];
        this.defaultAttr = {
            cell: [],
            link: []
        }
        this.historyStack = [];
    }

    var cell = function(cellId, cellAttr) {
        Log('Initialize Cell.');
    }

    var link = function(linkFromCellId, linkToCellId, linkId, linkAttr) {
        Log('Initialize Link.');
    }

    var Log = function(printTxt) {
        var print = true;
        if (print) {
            console.log('ETREECELL LOG :: ', printTxt)
        }
    }

    etreecell.prototype = {
        createCell: function(cellId, cellAttr) {
            Log('Create Cell.');
            this.cellArr.push(new cell(cellId, cellAttr));
        },
        createLink: function(linkFromCellId, linkToCellId, linkId, linkAttr) {
            Log('Create Link.');
            this.linkArr.push(new link(linkFromCellId, linkToCellId, linkId, linkAttr));
        }
    }

    window.etcl = window.etreecell = etreecell;

})(window);