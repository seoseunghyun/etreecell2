// Author : Seo SeungHyun (me@seunghyun.net).
(function() {
    var _svgUrl = "http://www.w3.org/2000/svg";
    var _xmlnsUrl = "http://www.w3.org/2000/xmlns/";
    var _xlinkUrl = "http://www.w3.org/1999/xlink";

    var etreecell = function(canvasId) {
        Log('INIT', 'Initialize etreecell canvas.');
        this.dom = {
            canvas: document.getElementById(canvasId),
            html: document.createElement("div")
        }
        this.svg = {
            canvas: document.createElementNS(_svgUrl, "svg"),
            linkingLine: document.createElementNS(_svgUrl, "path")
        }

        this.saveValues = {
            etreecell: ["defaultAttr"],
            cell: ["id", "typeId", "attr", "data"],
            link: ["id", "attr", "io", "id", "data"]
        };

        this.cell = {};
        this.link = {};
        this.typeList = {
            cell: {},
            link: {}
        }
        this.defaultAttr = {
            cell: {
                cell: {
                    "x": 20,
                    "y": 10,
                    "width": 200,
                    "height": 30,
                    "stroke": "white",
                    "fill": "none",
                    "stroke-width": 2,
                    "rx": 10,
                    "ry": 10,
                    "pointer-events": "visible",
                    "cursor": "pointer"
                },
                selected: {
                    "x": 0,
                    "y": 0,
                    "etcl-margin-left": -12,
                    "etcl-margin-right": -12,
                    "etcl-margin-top": -12,
                    "etcl-margin-bottom": -12,
                    "width": 100,
                    "height": 20,
                    "etcl-float": "left,top,right,bottom",
                    "stroke-dasharray": "3, 3",
                    "stroke-width": 2,
                    "stroke": "white",
                    "rx": 7,
                    "ry": 7,
                    "fill": "none"
                },
                resize: {
                    "etcl-margin-right": -7,
                    "etcl-margin-bottom": -7,
                    "etcl-float": "right,bottom",
                    "width": 10,
                    "height": 10,
                    "cursor": "nw-resize",
                    "fill": "rgba(255,255,255,.2)",
                    "etcl-d": "M 10 10 L 0 10 L 10 0 Z"
                },
                linker: {
                    "common": {
                        "fill": "rgba(255,255,255,.2)",
                        "cx": 6,
                        "cy": 6,
                        "r": 4,
                        "etcl-margin-right": -5,
                        "etcl-margin-top": -5,
                        "etcl-margin-bottom": -5,
                        "etcl-margin-left": -5
                    },
                    "top": {
                        "etcl-float": "x-center,top"
                    },
                    "right": {
                        "etcl-float": "y-center,right"
                    },
                    "bottom": {
                        "etcl-float": "x-center,bottom"
                    },
                    "left": {
                        "etcl-float": "y-center,left"
                    }
                }
            },
            link: {
                line: {
                    "stroke": "white",
                    "stroke-width": 2,
                    "fill": "none"
                },
                linkingLine: {
                    "d": "M 0 0 0 0",
                    "stroke-dasharray": "3,3",
                    "stroke": "rgba(255,255,255,.3)",
                    "stroke-width": 2,
                    "start-margin-left": -1,
                    "start-margin-top": -1,
                    "end-margin-left": -10,
                    "end-margin-top": -10
                }
            },
            helper: {
                css: {
                    body: 'body {user-select: none;}',
                    linkingLine: '.linkingLine { display:none;} .linkingLine.show { display:inline;}',
                    selector: '.selector { opacity: 0; z-index:-1; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000); } .selector.editing { stroke:#cef740; opacity:.7 !important; } .selector.selected {opacity:.3; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000); .selector.disable {display:none;} }',
                    resize: '.resize { opacity: 0; z-index:-1; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000); } .resize.selected {opacity:1; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000); } .resize.disable {display:none;}',
                    linker: '.linker { opacity: 0; z-index:-1; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000); } .linker.show {opacity:1; transition: opacity .2s cubic-bezier(0.860, 0.000, 0.070, 1.000);} .linker.linkingStart { fill:#009cff;opacity:1 !important; } .linker.linkingEnd { fill:#f13870;opacity:1 !important; }',
                }
            }
        }
        this.historyStack = {
            undo: [],
            redo: []
        }

        this.selected = {
            cell: [],
            link: []
        };
        this.editing = {
            cell: null,
            link: null
        };

        Log('INIT', 'Etreecell');
        this.draw();
        this.creatable(true);
        this.svg.canvas.etcl = this;

        var _cssString = "";
        for (var i in this.defaultAttr.helper.css) {
            _cssString += this.defaultAttr.helper.css[i] + " ";
        }
        this.createCSS(_cssString);
        return this;
    }

    etreecell.prototype = {
        createCell: function(cellId, cellAttr, cellType, cellData) {
            Log('ETCL', 'Create Cell.');
            var uniqId = guid();
            var _cell = this.cell[cellId || uniqId] = new cell(this, cellId || uniqId, cellAttr || {}, cellType || "textbox", cellData || null);
            return _cell;
        },
        createLink: function(outputCell, inputCell, linkAttr, linkData) {
            Log('ETCL', 'Create Link.');
            if (outputCell == inputCell) {
                Log("ETCL", "OutputCell and InputCell is equal cell.");
                return false;
            }
            if (!!this.link[outputCell.id + "_" + inputCell.id]) {
                Log("ETCL", "This is existed link.");
                return false;
            }
            var _link = this.link[outputCell.id + "_" + inputCell.id] = new link(this, outputCell, inputCell, outputCell.id + "_" + inputCell.id, linkAttr || {}, linkData || {});
            return _link;
        },
        getCellById: function(cellId) {
            Log('ETCL', 'Get cell id : ' + cellId);
            return this.cell[cellId] || false;
        },
        getLinkById: function(linkId) {
            Log('ETCL', 'Get link id : ' + linkId);
            return this.link[linkId] || false;
        },
        createCSS: function(cssContext) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = cssContext;
            document.getElementsByTagName('head')[0].appendChild(style);
        },
        creatable: function(creatableBool) {
            if (!!creatableBool) {}
        },
        draw: function() {
            this._draggingMove = false;
            this._draggingSelect = false;
            this._draggingResize = false;
            this._draggingTarget = false;

            this.svg.canvas.setAttribute('width', '100%');
            this.svg.canvas.setAttribute('height', '100%');
            this.svg.canvas.setAttribute('style', 'position:absolute;');
            this.svg.canvas.setAttribute('left', '0');
            this.svg.canvas.setAttribute('top', '0');
            this.svg.canvas.setAttributeNS(_xmlnsUrl, "xmlns:xlink", _xlinkUrl);
            this.dom.canvas.appendChild(this.svg.canvas);

            this.dom.html.setAttribute('width', '100%');
            this.dom.html.setAttribute('height', '100%');
            this.dom.html.setAttribute('style', 'position:absolute;');
            this.dom.html.setAttribute('left', '0');
            this.dom.html.setAttribute('top', '0');
            this.dom.canvas.appendChild(this.dom.html);

            for (var i in this.defaultAttr.link.linkingLine) {
                this.svg.linkingLine.setAttributeNS(null, i, this.defaultAttr.link.linkingLine[i]);
            }

            addClass(this.svg.linkingLine, "linkingLine");

            this.svg.canvas.appendChild(this.svg.linkingLine);
            this.svg.canvas.addEventListener("dblclick", function(e) {
                if (!this.etcl._draggingMove && !this._draggingSelect) {
                    this.etcl.createCell(null, { x: e.clientX - this.etcl.defaultAttr.cell.cell.width / 2 - this.etcl.defaultAttr.cell.cell["stroke-width"], y: e.clientY - this.etcl.defaultAttr.cell.cell.height / 2 - this.etcl.defaultAttr.cell.cell["stroke-width"] });
                }
            });
            this.svg.canvas.addEventListener("mousedown", function(e) {
                Log("ETCL", "mousedown");
                if (this.etcl.selected.cell.length == 0) {

                }
                this.etcl._originPos = {
                    x: e.clientX,
                    y: e.clientY
                }

                for (var i in this.etcl.selected.cell) {
                    var _cell = this.etcl.selected.cell[i];
                    _cell._originPos = {
                            x: _cell.getAttr('x'),
                            y: _cell.getAttr('y'),
                            width: _cell.getAttr('width'),
                            height: _cell.getAttr('height')
                        }
                        /*
                        _cell.setAttr({
                            x: _cell._originPos.x,
                            y: _cell._originPos.y
                        });
                        */
                }
                if (!!this.etcl._draggingResize) {
                    var _cell = this.etcl._draggingResize.cell;
                    _cell._originPos = {
                        x: _cell.getAttr('x'),
                        y: _cell.getAttr('y'),
                        width: _cell.getAttr('width'),
                        height: _cell.getAttr('height')
                    }
                }
                if (!!this.etcl._draggingLink) {
                    var _linker = this.etcl.svg.linkingLine;
                    var _margin = [_linker.getAttribute("start-margin-left"), _linker.getAttribute("start-margin-top"), _linker.getAttribute("end-margin-left"), _linker.getAttribute("end-margin-top")];

                    _linker.setAttributeNS(null, "d", "M 0 0 0 0");

                    addClass(_linker, "show");
                }
            }, false)
            this.svg.canvas.addEventListener("mousemove", function(e) {
                if (!!this.etcl._draggingMove) {
                    for (var i in this.etcl.selected.cell) {
                        var _cell = this.etcl.selected.cell[i];
                        _cell.setAttr({
                            x: _cell._originPos.x + e.clientX - this.etcl._originPos.x,
                            y: _cell._originPos.y + e.clientY - this.etcl._originPos.y
                        });
                    }
                }
                if (!!this.etcl._draggingResize) {
                    //for (var i in this.etcl.selected.cell) {
                    //var _cell = this.etcl.selected.cell[i];
                    _cell = this.etcl._draggingResize.cell;
                    _cell.setAttr({
                        width: ((_cell._originPos.width + e.clientX - this.etcl._originPos.x) < 1 ? 1 : (_cell._originPos.width + e.clientX - this.etcl._originPos.x)),
                        height: ((_cell._originPos.height + e.clientY - this.etcl._originPos.y) < 1 ? 1 : (_cell._originPos.height + e.clientY - this.etcl._originPos.y))
                    });
                    //}
                }
                if (!!this.etcl._draggingLink) {
                    var _linker = this.etcl.svg.linkingLine;
                    var _startLinker = this.etcl._draggingLink;
                    addClass(this.etcl._draggingLink, "linkingStart");
                    var _margin = [_linker.getAttribute("start-margin-left"), _linker.getAttribute("start-margin-top"), _linker.getAttribute("end-margin-left"), _linker.getAttribute("end-margin-top")];
                    _linker.setAttributeNS(null, "d", "M " + (parseInt(_startLinker.getAttribute("cx")) + parseInt(_margin[0])) + " " + (parseInt(_startLinker.getAttribute("cy")) + parseInt(_margin[1])) + " L " + (e.clientX + parseInt(_margin[2])) + " " + (e.clientY + parseInt(_margin[3])));

                }
            })
            this.svg.canvas.addEventListener("click", function(e) {
                if (!this.etcl._draggingResize) {
                    this.etcl.selectCell();
                }
                this.etcl._draggingResize = false;
            })
            this.svg.canvas.addEventListener("mouseup", function(e) {
                if (!!this.etcl._draggingLink && !!this.etcl._draggingTarget) {
                    this.etcl._draggingLink.cell.linkTo(this.etcl._draggingTarget.cell);
                }


                this.etcl._draggingMove = false;
                this.etcl._draggingLink = false;
                this.etcl._draggingTarget = false;

                var _startLinker = this.etcl.dom.canvas.getElementsByClassName("linkingStart");
                var _endLinker = this.etcl.dom.canvas.getElementsByClassName("linkingEnd");
                while (_startLinker.length != 0) {
                    removeClass(_startLinker[0], "linkingStart");
                }
                while (_endLinker.length != 0) {
                    removeClass(_endLinker[0], "linkingEnd");
                }
                removeClass(this.etcl.svg.linkingLine, "show");

            });

        },
        exportToJson: function() {
            var exportData = {
                etreecell: {},
                cell: {},
                link: {}
            };

            for (var i in this.saveValues.etreecell) {
                var key = this.saveValues.etreecell[i];
                exportData["etreecell"][key] = this[key];
            }
            for (var i in this.cell) {
                var cellKey = this.cell[i];
                exportData.cell[cellKey.id] = {};

                for (var j in this.saveValues.cell) {
                    var key = this.saveValues.cell[j];
                    exportData.cell[cellKey.id][key] = cellKey[key];

                }
            }
            for (var i in this.link) {
                var linkKey = this.link[i];
                exportData.link[linkKey.id] = {};

                for (var j in this.saveValues.link) {
                    var key = this.saveValues.link[j];
                    if (key == "io") {
                        exportData.link[linkKey.id]["io"] = {
                            output: linkKey[key].output.id,
                            input: linkKey[key].input.id
                        };
                    } else {
                        exportData.link[linkKey.id][key] = linkKey[key];
                    }
                }
            }
            Log("EXPORT TO JSON", exportData);
            return exportData;
        },
        importFromJson: function(rawJson) {
            Log("IMPORT FROM JSON", rawJson);
            var json = JSON.parse(rawJson);
            this.setDefaultAttr(json.etreecell.defaultAttr);
            for (var i in json.cell) {
                var _cell = json.cell[i];
                this.createCell(_cell.id, _cell.attr, _cell.type, _cell.data);
            }
            for (var i in json.link) {
                var _link = json.link[i];
                this.createLink(this.getCellById(_link.io.output), this.getCellById(_link.io.input), _link.attr, _link.data);
            }
            return this;

        },
        setDefaultAttr: function(attr) {
            Log("SET DEFAULT ATTR", attr);
            this.defaultAttr = attr;
            return this;
        },
        selectCell: function(cell) {
            for (var i in this.selected.cell) {
                this.selected.cell[i].removeClass("selected");
            }

            if (!!this.editing.cell) {
                if (this.editing.cell != cell) {
                    this.editing.cell.editEnd();
                }
            }
            this.selected.cell.splice(0, this.selected.cell.length);
            if (!cell) {
                return this;
            }
            if (cell instanceof Array) {
                for (var i in cell) {
                    this.selected.cell.push(cell[i]);
                    cell[i].addClass("selected");
                }
            } else {
                this.selected.cell.push(cell);
                cell.addClass("selected");
            }
            return this;
        },
        editStartCell: function(cell) {
            cell.addClass("editing");
            this.selectCell(cell);
            this.editing.cell = cell;

            try {
                cell.type.editStart();
                cell.type.tmpData = JSON.parse(JSON.stringify(cell.data));
                cell.setAttr({
                    x: cell.getAttr("x"),
                    y: cell.getAttr("y"),
                    width: cell.getAttr("width"),
                    height: cell.getAttr("height")
                })
            } catch (e) {
                Log("ETCL_TYPE", "Edit Start is not exist function." + e)
            }
        },
        editEndCell: function(cell) {
            cell.removeClass("editing");
            this.editing.cell = null;
            try {
                cell.type.editEnd();
            } catch (e) {
                Log("ETCL_TYPE", "Edit End is not exist function.")
            }

        },
        updateDataCell: function(cell, newData) {
            try {
                cell.type.updateData();
            } catch (e) {
                Log("ETCL_TYPE", "Update Data is not exist function.")
            }

        },
        editFocusCell: function(cell, newData) {
            try {
                cell.type.editFocus();
            } catch (e) {
                Log("ETCL_TYPE", "Edit Focus is not exist function.")
            }

        },
        addCellTypeList: function(typeObjectlist) {
            Log("ETCL_TYPE", "Add cell type");
            for (var i in typeObjectlist["cell"]) {
                this.typeList.cell[i] = typeObjectlist["cell"][i];
            }
            for (var i in typeObjectlist["link"]) {
                this.typeList.link[i] = typeObjectlist["link"][i];
            }
            return this;
        },
        createCellType: function(etcl, cell, typeId) {
            Log("ETCL_TYPE", "Create cell type");
            var type = new this.typeList.cell[typeId](etcl, cell, typeId);
            type.id = typeId;
            type.etcl = etcl;
            type.cell = cell;
            return type;
        }
    }

    var cell = function(etcl, cellId, cellAttr, cellType, cellData) {
        Log('CELL', 'Initialize Cell : ' + cellId);
        this.etcl = etcl;

        this.id = cellId;
        this.typeId = cellType;
        this.attr = {};
        this.io = {
            input: [],
            output: []
        };
        this.data = cellData;
        this.svg = {
            cell: null,
            selected: null,
            resize: null,
            linker: {
                top: null,
                right: null,
                bottom: null,
                left: null
            }
        }
        this.fitList = [];

        this.eventList = {
            "dragStart": [],
            "dragMove": [],
            "dragEnd": [],
            "editStart": [],
            "editEnd": [],
            "updateData": []
        }
        for (var i in etcl.defaultAttr.cell.cell) {
            this.attr[i] = etcl.defaultAttr.cell.cell[i];
        }
        for (var i in cellAttr) {
            this.attr[i] = cellAttr[i];
        }


        this.draggable(this.attr["draggable"] || true);
        this.type = etcl.createCellType(etcl, this, cellType);
        this.draw();
        return this;
    }

    cell.prototype = {
        draw: function() {
            Log("CELL", "Draw cell");
            // Cell
            this.svg.cell = document.createElementNS(_svgUrl, "rect");
            this.svg.cell.setAttributeNS(null, "id", this.id);
            this.svg.cell.cell = this;
            this.svg.cell.etcl = this.etcl;
            this.svg.cell.addEventListener("mousedown", function(e) {
                this.cell.etcl._draggingMove = true;
                this.cell.select();
            });
            this.svg.cell.addEventListener("mousemove", function(e) {});
            this.svg.cell.addEventListener("mouseenter", function(e) {
                for (var i in this.cell.svg.linker) {
                    addClass(this.cell.svg.linker[i], 'show');
                }
                if (!!this.etcl._draggingLink && this.etcl._draggingLink.cell.id != this.id) {
                    for (var i in this.cell.svg.linker) {
                        addClass(this.cell.svg.linker[i], 'linkingEnd');
                    }
                    this.etcl._draggingTarget = this;
                }

            });
            this.svg.cell.addEventListener("mouseleave", function(e) {
                for (var i in this.cell.svg.linker) {
                    removeClass(this.cell.svg.linker[i], 'show');
                    removeClass(this.cell.svg.linker[i], 'linkingEnd');
                }
                this.etcl._draggingTarget = false;
            });
            this.svg.cell.addEventListener("mouseup", function(e) {
                this.etcl._draggingMove = false;
            });
            this.svg.cell.addEventListener("click", function(e) {
                Log("CELL", "Click");
                e.stopPropagation();
            });
            this.svg.cell.addEventListener("dblclick", function(e) {
                Log("CELL", "DBLClick");
                e.stopPropagation();
                this.cell.editStart();
            });

            // Selector
            this.svg.selected = document.createElementNS(_svgUrl, "rect");
            this.svg.selected.setAttributeNS(null, "id", "selected_" + this.id);
            this.svg.selected.setAttributeNS(null, "etcl-cell-id", this.id);
            this.svg.selected.setAttributeNS(null, "class", "selector");
            for (var i in this.etcl.defaultAttr.cell.selected) {
                this.svg.selected.setAttributeNS(null, i, this.etcl.defaultAttr.cell.selected[i]);
            }
            this.svg.selected.cell = this;
            this.svg.selected.etcl = this.etcl;

            // Resize 
            this.svg.resize = document.createElementNS(_svgUrl, "path");
            this.svg.resize.setAttributeNS(null, "id", "resize_" + this.id);
            this.svg.resize.setAttributeNS(null, "etcl-cell-id", this.id);
            this.svg.resize.setAttributeNS(null, "class", "resize");
            this.svg.resize.cell = this;
            this.svg.resize.etcl = this.etcl;

            this.svg.linker = {
                top: document.createElementNS(_svgUrl, "circle"),
                right: document.createElementNS(_svgUrl, "circle"),
                bottom: document.createElementNS(_svgUrl, "circle"),
                left: document.createElementNS(_svgUrl, "circle"),
            }

            for (var i in this.svg.linker) {
                var _svgLinker = this.svg.linker[i];
                _svgLinker.setAttributeNS(null, "id", "linker_" + i + "_" + this.id);
                _svgLinker.setAttributeNS(null, "etcl-cell-id", this.id);
                _svgLinker.setAttributeNS(null, "class", "linker");
                _svgLinker.cell = this;
                _svgLinker.etcl = this.etcl;
                for (var j in this.etcl.defaultAttr.cell.linker.common) {
                    _svgLinker.setAttributeNS(null, j, this.etcl.defaultAttr.cell.linker.common[j]);
                }
                for (var j in this.etcl.defaultAttr.cell.linker[i]) {
                    _svgLinker.setAttributeNS(null, j, this.etcl.defaultAttr.cell.linker[i][j]);
                }
                _svgLinker.addEventListener("mouseenter", function(e) {
                    for (var j in this.cell.svg.linker) {
                        addClass(this.cell.svg.linker[j], 'show');
                    }
                });
                _svgLinker.addEventListener("mouseleave", function(e) {
                    for (var j in this.cell.svg.linker) {
                        removeClass(this.cell.svg.linker[j], 'show');
                        removeClass(this.cell.svg.linker[j], 'linkingEnd');
                    }
                });

                _svgLinker.addEventListener("mousedown", function(e) {
                    // TODO
                    this.etcl._draggingLink = this;
                });
                _svgLinker.addEventListener("mousemove", function(e) {
                    if (!!this.etcl._draggingLink && this.etcl._draggingLink != this) {
                        addClass(this, "linkingEnd");
                        this.etcl._draggingTarget = this;
                    }
                });
            }


            for (var i in this.etcl.defaultAttr.cell.resize) {
                this.svg.resize.setAttributeNS(null, i, this.etcl.defaultAttr.cell.resize[i]);
            }
            this.svg.resize.addEventListener("mousedown", function(e) {
                this.cell.etcl._draggingResize = this;
            })
            this.svg.resize.addEventListener("mousemove", function(e) {

            })
            this.svg.resize.addEventListener("mouseup", function(e) {

            })

            this.etcl.svg.canvas.appendChild(this.svg.selected);
            this.etcl.svg.canvas.appendChild(this.svg.resize);
            for (var i in this.svg.linker) {
                this.etcl.svg.canvas.appendChild(this.svg.linker[i]);
            }
            this.etcl.svg.canvas.appendChild(this.svg.cell);
            this.setAttr(this.attr);


            return this.svg.cell;
        },
        linkable: function() {

        },
        resizable: function(resizableBool) {
            if (resizableBool) {
                removeClass(this.svg.resize, "disable");
            } else {
                addClass(this.svg.resize, "disable");
            }
            return this;
        },
        editable: function(editableBool) {
            if (!!editableBool) {
                this.svg.cell.addEventListener("dblclick", function(e) {
                    e.stopPropagation();
                });
            }
            return this;
        },
        draggable: function(draggableBool) {
            Log("CELL", "Dragable");
            if (!!draggableBool) {}
            return this;
        },
        focus: function(focusBool) {},
        select: function() {
            this.etcl.selectCell(this);
        },
        editStart: function() {
            this.etcl.editStartCell(this);
            return this;
        },
        editEnd: function() {
            this.etcl.editEndCell(this);
            return this;
        },
        editFocus: function(newData) {
            this.etcl.editFocusCell(this, newData);
            return this;
        },
        updateData: function(newData) {
            this.etcl.updateDataCell(this, newData);
            return this;
        },
        getAttr: function(attr) {
            return this.attr[attr] || false;
        },
        getLinksByOutput: function() {
            var link = [];
            for (var i in this.io.output) {
                link.push(this.etcl.getLinkById(this.io.output[i].id + "_" + this.id));
            }
            return link;
        },

        getLinksByInput: function() {
            var link = [];
            for (var i in this.io.input) {
                link.push(this.etcl.getLinkById(this.id + "_" + this.io.input[i].id));
            }
            return link;
        },
        addFit: function() {

        },
        floatFit: function(object, moveValue, moveType) {
            var value = 0;
            var float = (object.getAttribute("etcl-float") || "left,top").replace("/ /gi", "").split(",");

            var values = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
            if (float.indexOf("left") !== -1) {
                values.x = (moveType == "x" ? moveValue : this.getAttr("x")) + parseInt(object.getAttribute("etcl-margin-left") || 0);
            }
            if (float.indexOf("right") !== -1) {
                values.x = (moveType == "x" ? moveValue : this.getAttr("x")) + parseInt(this.getAttr("width")) - parseInt(object.getAttribute("width") || 0) - parseInt(object.getAttribute("etcl-margin-right") || 0);
            }
            if (float.indexOf("top") !== -1) {
                values.y = (moveType == "y" ? moveValue : this.getAttr("y")) + parseInt(object.getAttribute("etcl-margin-top") || 0);
            }
            if (float.indexOf("x-center") !== -1) {
                values.x = (moveType == "x" ? moveValue : this.getAttr("x")) + parseInt(this.getAttr("width") / 2);
            }
            if (float.indexOf("y-center") !== -1) {
                values.y = (moveType == "y" ? moveValue : this.getAttr("y")) + parseInt(this.getAttr("height") / 2);
            }
            if (float.indexOf("bottom") !== -1) {
                values.y = (moveType == "y" ? moveValue : this.getAttr("y")) + parseInt(this.getAttr("height")) - parseInt(object.getAttribute("height") || 0) - parseInt(object.getAttribute("etcl-margin-bottom") || 0);

            }
            if (float.indexOf("left") !== -1 && float.indexOf("right") !== -1) {
                values.x = (moveType == "x" ? moveValue : this.getAttr("x")) + parseInt(object.getAttribute("etcl-margin-left") || 0);
                values.width = (moveType == "width" ? moveValue : 0) + parseInt(object.getAttribute("etcl-margin-right") * -1 || 0) + parseInt(object.getAttribute("etcl-margin-left") * -1 || 0)
            }
            if (float.indexOf("top") !== -1 && float.indexOf("bottom") !== -1) {
                values.y = (moveType == "y" ? moveValue : this.getAttr("y")) + parseInt(object.getAttribute("etcl-margin-top") || 0);
                values.height = (moveType == "height" ? moveValue : 0) + parseInt(object.getAttribute("etcl-margin-top") * -1 || 0) + parseInt(object.getAttribute("etcl-margin-bottom") * -1 || 0)
            }

            switch (object.tagName.toLowerCase()) {
                case "rect":
                    object.setAttributeNS(null, moveType, values[moveType]);
                    break;
                case "path":
                    movePath(object, values.x, values.y);
                    break;
                case "circle":
                    object.setAttributeNS(null, "cx", values.x);
                    object.setAttributeNS(null, "cy", values.y);
                    break;
                default:
                    object.style.position = "absolute";
                    if (moveType == "x") {
                        object.style.left = values.x;
                    } else if (moveType == "y") {
                        object.style.top = values.y;
                    } else if (moveType == "width") {
                        object.style.width = values.width;
                    } else if (moveType == "height") {
                        object.style.height = values.height;
                    }
                    break;
            }

            return this;
        },
        setAttr: function(attr) {
            Log("CELL", "Set the cell style.");
            var _svgAttr = ["id", "d", "x", "y", "cx", "xy", "r", "width", "height", "stroke", "fill", "stroke-width", "rx", "ry", "pointer-events"];
            var _cssAttr = ["cursor"];
            if (typeof attr == "object") {
                for (var i in attr) {

                    if (_svgAttr.indexOf(i) !== -1) {
                        this.svg.cell.setAttributeNS(null, i, attr[i]);
                        this.attr[i] = attr[i];

                        if (i == "x" || i == "y" || i == "width" || i == "height") {
                            this.floatFit(this.svg.resize, attr[i], i);
                            this.floatFit(this.svg.selected, attr[i], i);
                            this.floatFit(this.svg.linker.top, attr[i], i);
                            this.floatFit(this.svg.linker.right, attr[i], i);
                            this.floatFit(this.svg.linker.bottom, attr[i], i);
                            this.floatFit(this.svg.linker.left, attr[i], i);
                        }
                        for (var j in this.fitList) {
                            if (i == "x" || i == "y" || i == "width" || i == "height") {
                                this.floatFit(this.fitList[j], attr[i], i);
                            }
                        }

                    } else if (_cssAttr.indexOf(i) !== -1) {
                        this.svg.cell.style[i] = attr[i];
                        this.attr[i] = attr[i];
                    }
                }
            }

            var outputLinks = this.getLinksByOutput();
            for (var j in outputLinks) {
                outputLinks[j].updateLine();
            }
            var inputLinks = this.getLinksByInput();
            for (var j in inputLinks) {
                inputLinks[j].updateLine();
            }
            return this;
        },
        addEvent: function(type, func) {
            this.eventList[type].push(func);
            return this;
        },
        linkTo: function(linkCell, linkAttr) {
            Log("LINK", "Link to " + linkCell.id);
            this.etcl.createLink(this, linkCell, linkAttr || []);
            return this;
        },
        addClass: function(className) {
            addClass(this.svg.cell, className);
            addClass(this.svg.selected, className);
            addClass(this.svg.resize, className);
            return this;
        },
        removeClass: function(className) {
            removeClass(this.svg.cell, className);
            removeClass(this.svg.selected, className);
            removeClass(this.svg.resize, className);
            return this;
        },
        hasClass: function(className) {
            return hasClass(this.svg.cell, className);
        }
    }

    var link = function(etcl, outputCell, inputCell, linkId, linkAttr, linkData) {
        Log('LINK', 'Initialize Link.' + linkId);
        this.etcl = etcl;
        this.id = linkId;
        this.attr = {};
        this.data = linkData;
        this.svg = {
            line: null,
            text: null
        }
        this.io = {
            output: outputCell,
            input: inputCell
        }
        for (var i in etcl.defaultAttr.link.line) {
            this.attr[i] = etcl.defaultAttr.link.line[i];

        }
        for (var i in linkAttr) {
            this.attr[i] = linkAttr[i];
        }
        outputCell.io.input.push(inputCell);
        inputCell.io.output.push(outputCell);

        this.draw();
    }

    link.prototype = {
        draw: function() {
            Log("LINK", "Draw link");
            this.svg.line = document.createElementNS(_svgUrl, "path");
            this.svg.line.setAttributeNS(null, "id", this.id);
            this.setAttr(this.attr);
            this.etcl.svg.canvas.appendChild(this.svg.line);
            this.svg.line.link = this;
            this.svg.line.etcl = this.etcl;
            this.updateLine();
            return this.svg.line;
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
            this.svg.line.setAttributeNS(null, "d", ['M', x1.toFixed(3), y1.toFixed(3), 'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(' ').toString());
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
                        this.svg.line.setAttributeNS(null, i, attr[i]);
                        this.attr[i] = attr[i];
                    } else if (_cssAttr.indexOf(i) !== -1) {
                        this.svg.line.style[i] = attr[i];
                        this.attr[i] = attr[i];
                    }
                }
            }
            return this;
        },
        setData: function(data) {
            for (var i in data) {
                this.data[i] = data[i];
            }
            return this;
        },
        getData: function(dataKey) {
            return this.data(dataKey);
        },
        getAttr: function() {
            return this.attr[attr] || false;
        }
    }




    var Log = function(key, printTxt) {
        var print = true;
        if (print && key == "ETCL_TYPE") {
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

    var hasClass = function(el, className) {
        if (el.classList)
            return el.classList.contains(className);
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }

    var addClass = function(el, className) {
        if (el.classList)
            el.classList.add(className)
        else if (!hasClass(el, className))
            el.className += " " + className;
    }

    var removeClass = function(el, className) {
        if (el.classList)
            el.classList.remove(className)
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }
    var movePath = function(object, moveX, moveY) {
        var rawPath = object.getAttribute("etcl-d").split(" ");
        var xyFlag = true;
        for (var i in rawPath) {
            if (!isNaN(parseInt(rawPath[i]))) {
                if (xyFlag) {
                    rawPath[i] = parseInt(rawPath[i]) + moveX;
                } else {
                    rawPath[i] = parseInt(rawPath[i]) + moveY;
                }
                xyFlag = !xyFlag;
            }

        }
        object.setAttributeNS(null, "d", rawPath.join(" "));
        return rawPath.join(" ");
    }

    window.etcl = window.etreecell = etreecell;

})(window);