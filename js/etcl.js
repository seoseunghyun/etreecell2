(function() {
    var etreecell = function(canvasId) {
        Log('[INIT] Initialize etreecell canvas.');
        this.canvasDom = document.getElementById(canvasId);
        this.canvasSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        this.attr = {};
        this.cells = {};
        this.links = {};
        this.defaultAttr = {
            cell: {},
            link: {}
        }
        this.historyStack = {
            undo: [],
            redo: []
        }

        Log('[INIT] Create & Append SVG Object');
        this.canvasSVG.setAttribute('width', '100%');
        this.canvasSVG.setAttribute('height', '100%');
        this.canvasSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        this.canvasDom.appendChild(this.canvasSVG);
    }

    etreecell.prototype = {
        createCell: function(cellId, cellAttr) {
            Log('[ETCL/CREATE] Create Cell.');
            this.cells[cellId] = new cell(this, cellId, cellAttr || []);
        },
        createLink: function(linkFromCellId, linkToCellId, linkId, linkAttr) {
            Log('[ETCL/CREATE] Create Link.');
            this.links[linkId] = new link(this, linkFromCellId, linkToCellId, linkId, linkAttr || []);
        },
        getCellById: function(cellId) {
            Log('[ETCL/GET] Get cell id : ' + cellId);
            return this.cells[cellId] || false;
        },
        getLinkById: function(linkId) {
            Log('[ETCL/GET] Get link id : ' + linkId);
            return this.links[linkId] || false;
        }
    }

    var cell = function(etcl, cellId, cellAttr) {
        Log('[CELL] Initialize Cell : ' + cellId);
        this.id = cellId;
        this.etcl = etcl;
        this.attr = cellAttr;
    }

    cell.prototype = {

    }

    var link = function(etcl, linkFromCellId, linkToCellId, linkId, linkAttr) {
        Log('[LINK] Initialize Link.' + linkId);
        this.id = linkId;
        this.etcl = etcl;
        this.fromCellId = linkFromCellId;
        this.toCellId = linkToCellId;
    }

    link.prototype = {

    }

    var Log = function(printTxt) {
        var print = true;
        if (print) {
            console.log('ETREECELL LOG :: ', printTxt)
        }
    }

    window.etcl = window.etreecell = etreecell;

})(window);