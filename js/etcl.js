(function() {
    var _svgUrl = "http://www.w3.org/2000/svg";
    var _xmlnsUrl = "http://www.w3.org/2000/xmlns/";
    var _xlinkUrl = "http://www.w3.org/1999/xlink";

    var etreecell = function(canvasId) {
        Log('INIT', 'Initialize etreecell canvas.');
        this.canvasDom = document.getElementById(canvasId);
        this.canvasSVG = document.createElementNS(_svgUrl, "svg");

        this.attr = {};
        this.cells = {};
        this.links = {};
        this.defaultAttr = {
            cell: {
                "x": 10,
                "y": 10,
                "width": 120,
                "height": 30,
                "stroke": "black",
                "fill": "none",
                "stroke-width": 2,
                "d": "M 5 5 L 50 50",
                "rx": 10,
                "ry": 10
            },
            link: {}
        }
        this.historyStack = {
            undo: [],
            redo: []
        }

        Log('INIT', 'Create & Append SVG Object');
        this.canvasSVG.setAttribute('width', '100%');
        this.canvasSVG.setAttribute('height', '100%');
        this.canvasSVG.setAttributeNS(_xmlnsUrl, "xmlns:xlink", _xlinkUrl);
        this.canvasDom.appendChild(this.canvasSVG);
    }

    etreecell.prototype = {
        createCell: function(cellId, cellAttr) {
            Log('ETCL', 'Create Cell.');
            this.cells[cellId] = new cell(this, cellId || guid(), cellAttr || []);
            return this.cells[cellId];
        },
        createLink: function(linkFromCellId, linkToCellId, linkId, linkAttr) {
            Log('ETCL', 'Create Link.');
            this.links[linkId] = new link(this, linkFromCellId, linkToCellId, linkId || guid(), linkAttr || []);
            return this.links[linkId];
        },
        getCellById: function(cellId) {
            Log('ETCL', 'Get cell id : ' + cellId);
            return this.cells[cellId] || false;
        },
        getLinkById: function(linkId) {
            Log('ETCL', 'Get link id : ' + linkId);
            return this.links[linkId] || false;
        }
    }

    var cell = function(etcl, cellId, cellAttr) {
        Log('CELL', 'Initialize Cell : ' + cellId);
        this.id = cellId;
        this.etcl = etcl;
        this.attr = etcl.defaultAttr.cell;
        this.cellSVG = null;
        this.io = {
            input: [],
            output: []
        };

        for (var i in cellAttr) {
            this.attr[i] = cellAttr[i];
        }
        this.draw();
    }

    cell.prototype = {
        draw: function() {
            Log("CELL", "Draw cell");
            this.cellSVG = document.createElementNS(_svgUrl, "rect");
            var _svgAttr = ["id", "d", "x", "y", "width", "height", "stroke", "fill", "stroke-width", "rx", "ry"];
            this.cellSVG.setAttributeNS(null, "id", this.id);
            for (var i in _svgAttr) {
                this.cellSVG.setAttributeNS(null, _svgAttr[i], this.attr[_svgAttr[i]]);
            }
            this.etcl.canvasSVG.appendChild(this.cellSVG);
            return this.cellSVG;
        },
        dragable: function(dragableBool) {

        }
    }

    var link = function(etcl, linkFromCellId, linkToCellId, linkId, linkAttr) {
        Log('LINK', 'Initialize Link.' + linkId);
        this.id = linkId;
        this.etcl = etcl;
        this.fromCellId = linkFromCellId;
        this.toCellId = linkToCellId;
    }

    link.prototype = {

    }

    var Log = function(key, printTxt) {
        var print = true;
        if (print) {
            if (typeof printTxt == 'object') {
                printTxt = JSON.stringify(printTxt);
            }
            console.log('[ETREECELL] [' + key + '] ' + printTxt);
        }
    }

    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    window.etcl = window.etreecell = etreecell;

})(window);