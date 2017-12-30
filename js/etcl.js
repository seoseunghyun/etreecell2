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
        this.saveValues = ["cells", "links", "defaultAttr"];

        this.cells = {};
        this.links = {};
        this.cellTyper = cellTyper;
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
            link: {
                "stroke": "black",
                "stroke-width": 2,
                "fill": "none"
            }
        }
        this.historyStack = {
            undo: [],
            redo: []
        }


        this.helper = {
            output: [],
            input: []
        };
        this.selected = {
            cell: [],
            link: []
        };

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
            var uniqId = guid();
            var _cell = this.cells[cellId || uniqId] = new cell(this, cellId || uniqId, cellAttr || [], cellType || "textbox");
            return _cell;
        },
        createLink: function(outputCell, inputCell, linkAttr) {
            Log('ETCL', 'Create Link.');
            if (!!this.links[outputCell.id + "_" + inputCell.id]) {
                Log("ETCL", "This is existed links.");
                return false;
            }
            var _link = this.links[outputCell.id + "_" + inputCell.id] = new link(this, outputCell, inputCell, outputCell + "_" + inputCell, linkAttr || []);
            return _link;
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
                            var outputLinks = _cell.getLinksByOutput();
                            for (var j in outputLinks) {
                                outputLinks[j].updateLine();
                            }
                            var inputLinks = _cell.getLinksByInput();
                            for (var j in inputLinks) {
                                inputLinks[j].updateLine();
                            }
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
        },
        exportToJson: function() {
            /*
            var exportData = {};
            for (var i in this.saveValues) {
                exportData[this.saveValues[i]] = this[this.saveValues[i]];
                console.log(this[this.saveValues[i]]);
            }
            console.log(exportData);
            return JSON.stringify(exportData);
            */
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
            this.cellSVG.etcl = this.etcl;
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
        getLinksByOutput: function() {
            var links = [];
            for (var i in this.io.output) {
                links.push(this.etcl.getLinkById(this.io.output[i].id + "_" + this.id));
            }
            return links;
        },

        getLinksByInput: function() {
            var links = [];
            for (var i in this.io.input) {
                links.push(this.etcl.getLinkById(this.id + "_" + this.io.input[i].id));
            }
            return links;
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
        linkTo: function(linkCell, linkAttr) {
            Log("LINK", "Link to " + linkCell.id);
            this.etcl.createLink(this, linkCell, linkAttr || []);
            return this;
        }
    }

    var link = function(etcl, outputCell, inputCell, linkId, linkAttr) {
        Log('LINK', 'Initialize Link.' + linkId);
        this.id = linkId;
        this.etcl = etcl;
        this.attr = {};
        this.linkSVG = null;
        this.io = {
            output: outputCell,
            input: inputCell
        }
        outputCell.io.input.push(inputCell);
        inputCell.io.output.push(outputCell);



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
            this.linkSVG.etcl = this.etcl;
            this.updateLine();
            return this.linkSVG;
        },
        updateLine: function() {
            this.drawLine(this.io.output.getAttr('x'), this.io.output.getAttr('y'), this.io.output.getAttr('width'), this.io.output.getAttr('height'), this.io.output.getAttr('stroke-width'),
                this.io.input.getAttr('x'), this.io.input.getAttr('y'), this.io.input.getAttr('width'), this.io.input.getAttr('height'), this.io.input.getAttr('stroke-width'));
        },
        drawLine: function(x1, y1, width1, height1, margin1, x2, y2, width2, height2, margin2) {
            Log("LINK", "draw line of link");

            var path = [{ x: x1 + width1 / 2, y: y1 - margin1 / 2 },
                { x: x1 + width1 / 2, y: y1 + height1 + margin1 / 2 },
                { x: x1 - margin1 / 2, y: y1 + height1 / 2 },
                { x: x1 + width1 + margin1 / 2, y: y1 + height1 / 2 },
                { x: x2 + width2 / 2, y: y2 - margin2 / 2 },
                { x: x2 + width2 / 2, y: y2 + height2 + margin2 / 2 },
                { x: x2 - margin2 / 2, y: y2 + height2 / 2 },
                { x: x2 + width2 + margin2 / 2, y: y2 + height2 / 2 }
            ];

            var d = {},
                distance = [];
            for (var i = 0; i < 4; i++) {
                for (var j = 4; j < 8; j++) {
                    var dx = Math.abs(path[i].x - path[j].x),
                        dy = Math.abs(path[i].y - path[j].y);
                    if ((i == j - 4) || (((i != 3 && j != 6) || path[i].x < path[j].x) && ((i != 2 && j != 7) || path[i].x > path[j].x) && ((i != 0 && j != 5) || path[i].y > path[j].y) && ((i != 1 && j != 4) || path[i].y < path[j].y))) {
                        distance.push(dx + dy);
                        d[distance[distance.length - 1]] = [i, j];
                    }
                }
            }
            var fixPoint, autoPoint;
            if (distance.length == 0) {
                fixPoint = [0, 4];
            } else {
                fixPoint = d[Math.min.apply(Math, distance)];

            }
            /*
            if (!!_fixPoint_) {
                //시계방향 4분면과 이 함수에서의 4분면의 호환을 위한 파싱 함수.
                var parsePosit = function(__x_) {
                    var __parseX;
                    switch (__x_) {
                        case 0:
                            __parseX = 0;
                            break;
                        case 1:
                            __parseX = 3;
                            break;
                        case 2:
                            __parseX = 1;
                            break;
                        case 3:
                            __parseX = 2;
                            break;
                        default:
                            break;
                    }
                    return __parseX;
                }
                var unparsePosit = function(__x_) {
                    var __parseX;
                    switch (__x_) {
                        case 0:
                            __parseX = 2;
                            break;
                        case 1:
                            __parseX = 0;
                            break;
                        case 2:
                            __parseX = 1;
                            break;
                        case 3:
                            __parseX = 3;
                            break;
                        default:
                            break;
                    }
                    return __parseX;
                }
                var marginPosit = function(__x_) {
                    var __parseX;
                    switch (__x_) {
                        case 0:
                            __parseX = -4;
                            break;
                        case 1:
                            __parseX = 4;
                            break;
                        case 2:
                            __parseX = 0;
                            break;
                        case 3:
                            __parseX = 0;
                            break;
                        default:
                            break;
                    }
                    return __parseX;
                }

                if (_fixPoint_[0] != 'auto') {
                    fixPoint[0] = parsePosit(_fixPoint_[0]);
                }
                if (_fixPoint_[1] != 'auto') {
                    fixPoint[1] = parsePosit(_fixPoint_[1]) + 4;
                }
                if (ETCL_STATUS['movingLinker'] != 0) {
                    var _linker = ETCL_CONTENTS['cell'][ETCL_STATUS['movingLinker'][0]]['linker'][ETCL_STATUS['movingLinker'][1]];
                    _linker.transform('t0 ' + marginPosit(fixPoint[1] - 4) + 'r' + unparsePosit(fixPoint[1] - 4) * 90);

                }
            }
            */
            var x1 = path[fixPoint[0]].x,
                y1 = path[fixPoint[0]].y,
                x4 = path[fixPoint[1]].x,
                y4 = path[fixPoint[1]].y;

            dx = Math.max(Math.abs(x1 - x4) / 2, 10);
            dy = Math.max(Math.abs(y1 - y4) / 2, 10);
            var x2 = [x1, x1, x1 - dx, x1 + dx][fixPoint[0]].toFixed(3),
                y2 = [y1 - dy, y1 + dy, y1, y1][fixPoint[0]].toFixed(3),
                x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][fixPoint[1]].toFixed(3),
                y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][fixPoint[1]].toFixed(3);
            this.linkSVG.setAttributeNS(null, "d", ['M', x1.toFixed(3), y1.toFixed(3), 'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(' ').toString());
            return this;
        },
        addEvent: function(type, func) {
            this.eventList[type].push(func);
        },
        setAttr: function(attr) {
            Log("LINK", "Set the link style.");
            var _svgAttr = ["id", "d", "x", "y", "width", "height", "stroke", "fill", "stroke-width", "rx", "ry", "pointer-events"];
            var _cssAttr = ["cursor"];
            if (typeof attr == "object") {
                for (var i in attr) {
                    if (_svgAttr.indexOf(i) !== -1) {
                        this.linkSVG.setAttributeNS(null, i, attr[i]);
                        this.attr[i] = attr[i];
                    } else if (_cssAttr.indexOf(i) !== -1) {
                        this.linkSVG.style[i] = attr[i];
                        this.attr[i] = attr[i];
                    }
                }
            }
            return this;
        },
        getAttr: function() {
            return this.attr[attr] || false;
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