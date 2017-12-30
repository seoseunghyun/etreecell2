(function() {
    var _svgUrl = "http://www.w3.org/2000/svg";
    var _xmlnsUrl = "http://www.w3.org/2000/xmlns/";
    var _xlinkUrl = "http://www.w3.org/1999/xlink";

    var etreecell = function(canvasId) {
        Log('INIT', 'Initialize etreecell canvas.');
        this.canvasDom = document.getElementById(canvasId);
        this.canvasSVG = document.createElementNS(_svgUrl, "svg");
        this.canvasSVG.etcl = this;

        // Datas
        this.attr = {};
        this.cells = {};
        this.links = {};
        this.cellTyper = cellTyper;
        this.helper = {
            output: [],
            input: []
        };
        this.selected = {
            cell: [],
            link: []
        };
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
                "ry": 10,
                "pointer-events": "visible",
                "cursor": "pointer"
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
        this.draggable(true);
        this.linkable(true);
    }

    etreecell.prototype = {
        createCell: function(cellId, cellAttr, cellType) {
            Log('ETCL', 'Create Cell.');
            this.cells[cellId] = new cell(this, cellId || guid(), cellAttr || [], cellType || "textbox");
            return this.cells[cellId];
        },
        createLink: function(inputCell, outputCell, linkId, linkAttr) {
            Log('ETCL', 'Create Link.');
            this.links[linkId] = new link(this, inputCell, outputCell, linkId || guid(), linkAttr || []);
            return this.links[linkId];
        },
        getCellById: function(cellId) {
            Log('ETCL', 'Get cell id : ' + cellId);
            return this.cells[cellId] || false;
        },
        getLinkById: function(linkId) {
            Log('ETCL', 'Get link id : ' + linkId);
            return this.links[linkId] || false;
        },
        draggable: function(draggableBool) {
            this._draggingMove = false;
            this._draggingSelect = false;
            if (!!draggableBool) {
                this.canvasSVG.addEventListener("mousedown", function(e) {
                    if (this.etcl.selected.cell.length == 0) {
                        this.etcl._draggingMove = true;
                    }
                    this.etcl._originPos = {
                        x: e.clientX,
                        y: e.clientY
                    }
                    for (var i in this.etcl.selected.cell) {
                        var _cell = this.etcl.selected.cell[i].cell;
                        _cell._originPos = {
                            x: _cell.getAttr('x'),
                            y: _cell.getAttr('y'),
                        }
                    }
                })
                this.canvasSVG.addEventListener("mousemove", function(e) {
                    if (!!this.etcl._draggingMove) {
                        for (var i in this.etcl.selected.cell) {
                            var _cell = this.etcl.selected.cell[i].cell;
                            _cell.setAttr({
                                x: _cell._originPos.x + e.clientX - this.etcl._originPos.x,
                                y: _cell._originPos.y + e.clientY - this.etcl._originPos.y
                            })
                        }
                    }
                })
                this.canvasSVG.addEventListener("mouseup", function(e) {
                    Log("ETCL", "mouseup");
                    this.etcl._draggingSelect = false;
                    this.etcl._draggingMove = false;
                    this.etcl.selected.cell.splice(0, this.etcl.selected.cell.length);
                })
            }
        },
        linkable: function(linkableBool) {
            if (!!linkableBool) {

            }
        }
    }

    var cell = function(etcl, cellId, cellAttr, cellType) {
        Log('CELL', 'Initialize Cell : ' + cellId);
        this.id = cellId;
        this.etcl = etcl;
        this.attr = {}
        this.cellSVG = null;
        this.cellType = new cellTyper(etcl, this, cellType);
        this.eventList = {
            "dragstart": [],
            "dragmove": [],
            "dragend": [],
            "editstart": [],
            "editend": [],
        }
        this.io = {
            input: [],
            output: []
        };
        for (var i in etcl.defaultAttr.cell) {
            this.attr[i] = etcl.defaultAttr.cell[i];
        }
        this.draw();
        this.draggable(this.attr["draggable"] || true);

        return this;
    }

    cell.prototype = {
        draw: function() {
            Log("CELL", "Draw cell");
            this.cellSVG = document.createElementNS(_svgUrl, "rect");
            this.cellSVG.setAttributeNS(null, "id", this.id);
            this.setAttr(this.attr);
            this.etcl.canvasSVG.appendChild(this.cellSVG);
            this.cellSVG.cell = this;
            return this.cellSVG;
        },
        draggable: function(draggableBool) {
            Log("CELL", "Dragable");
            if (!!draggableBool) {
                this.cellSVG.addEventListener("mousedown", function(e) {
                    Log("CELL", "DragStart");
                    this.cell.etcl._draggingMove = true;
                    this.cell.etcl.selected.cell.push(this);

                });
                this.cellSVG.addEventListener("mousemove", function(e) {});
                this.cellSVG.addEventListener("mouseup", function(e) {
                    Log("CELL", "DragEnd");
                    this.cell.etcl.selected.cell.splice(this.cell.etcl.selected.cell.indexOf(this), 1);
                });
            }
            return draggableBool;
        },
        focus: function(focusBool) {},
        getAttr: function(attr) {
            return this.attr[attr] || false;
        },
        setAttr: function(attr) {
            Log("CELL", "Set the cell style.");
            var _svgAttr = ["id", "d", "x", "y", "width", "height", "stroke", "fill", "stroke-width", "rx", "ry", "pointer-events"];
            var _cssAttr = ["cursor"];
            if (typeof attr == "object") {
                for (var i in attr) {
                    if (_svgAttr.indexOf(i) !== -1) {
                        this.cellSVG.setAttributeNS(null, i, attr[i]);
                        this.attr[i] = attr[i];
                    } else if (_cssAttr.indexOf(i) !== -1) {
                        this.cellSVG.style[i] = attr[i];
                        this.attr[i] = attr[i];
                    }
                }
            }
            return this;
        },
        addEvent: function(type, func) {
            this.eventList[type].push(func);
        },
        linkTo: function(linkCell, linkId, linkAttr) {
            Log("LINK TO", this.id + " to " + linkCell.id);
            var newLink = new link(this.etcl, linkCell, linkId || guid(), linkAttr || []);
        },
        linkFrom: function(linkCell) {}
    }

    var link = function(etcl, inputCell, outputCell, linkId, linkAttr) {
        Log('LINK', 'Initialize Link.' + linkId);
        this.id = linkId;
        this.etcl = etcl;
        this.attr = {};
        this.linkSVG = null;
        this.io = {
            input: inputCell,
            output: outputCell
        }

        for (var i in etcl.defaultAttr.link) {
            this.attr[i] = etcl.defaultAttr.link[i];
        }
        this.draw();
    }

    link.prototype = {
        draw: function() {
            Log("LINK", "Draw link");
            this.linkSVG = document.createElementNS(_svgUrl, "path");
            this.linkSVG.setAttributeNS(null, "id", this.id);
            this.setAttr(this.attr);
            this.etcl.canvasSVG.appendChild(this.linkSVG);
            this.linkSVG.link = this;
            return this.linkSVG;
        },
        drawLine: function(x1, y1, width1, height1, x2, y2, width2, height2) {
            Log("LINK", "draw line of link");
        },
        setAttr: function() {

        },
        getAttr: function() {

        }
    }


    var cellTyper = function(etcl, cell, cellType) {
        this.etcl = etcl;
        this.cell = cell;
        this.cellType = cellType;
        try {
            this[cellType](etcl, cell);
        } catch (e) {
            Log("CELL TYPER", "This is not valid cell type.");
        }
    }

    cellTyper.prototype = {
        textbox: function(etcl, cell) {

        }
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
    window.etclCellTyper = window.etreecellCellTyper = window.etclct = cellTyper;

})(window);