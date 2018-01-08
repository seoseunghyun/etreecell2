var newTypes = {
    cell: {
        textbox: function(etcl, cell, typeId) {
            this.cell = cell;
            this.etcl = etcl;
            this.tmpData = {};

            // SVG Object of default style.
            this.initObject = {
                textDiv: document.createElement("div")
            };
            // SVG Object of default style.
            this.editingObject = {
                textbox: document.createElement("textarea")
            };

            if (cell.data == null) {
                cell.data = {
                    text: "Double click for edit.",
                    style: {
                        "border": "none",
                        "text-align": "center",
                        "color": "white",
                        "background": "none",
                        "font-size": "15px",
                        "pointer-events": "none",
                        "line-height": "100%",
                        "overflow": "hidden"
                    }
                }
            }
            this.initObject.textDiv.setAttribute("etcl-float", "left,top,right,bottom");
            this.initObject.textDiv.setAttribute("etcl-margin-left", "9");
            this.initObject.textDiv.setAttribute("etcl-margin-top", "9");
            this.initObject.textDiv.setAttribute("etcl-margin-bottom", "9");
            this.initObject.textDiv.setAttribute("etcl-margin-right", "9");
            for (var i in cell.data.style) {
                this.initObject.textDiv.style[i] = cell.data.style[i];
            }

            this.editingObject.textbox.setAttribute("etcl-float", "left,top,right,bottom");
            this.editingObject.textbox.setAttribute("etcl-margin-left", "8");
            this.editingObject.textbox.setAttribute("etcl-margin-top", "8");
            this.editingObject.textbox.setAttribute("etcl-margin-bottom", "8");
            this.editingObject.textbox.setAttribute("etcl-margin-right", "8");
            this.editingObject.textbox.style.resize = "none";
            this.editingObject.textbox.style.outline = "none";
            this.editingObject.textbox.style.border = "none";
            this.editingObject.textbox.style.color = "white";
            this.editingObject.textbox.style.background = "none";
            this.editingObject.textbox.style["font-size"] = "13px";
            this.editingObject.textbox.style["text-align"] = "center";
            this.editingObject.textbox.cellType = this;

            cell.fitList.push(this.editingObject.textbox);
            cell.fitList.push(this.initObject.textDiv);
            this.updateData(cell.data);
        }
    }
}
newTypes.cell.textbox.prototype = {
    // Etreecell Global Overwrite Function.
    editStart: function() {
        this.etcl.dom.html.appendChild(this.editingObject.textbox);
        this.etcl.dom.html.removeChild(this.initObject.textDiv);
        this.editingObject.textbox.value = this.initObject.textDiv.innerHTML;
        this.editFocus();
    },
    editEnd: function() {
        this.etcl.dom.html.removeChild(this.editingObject.textbox);
        this.etcl.dom.html.appendChild(this.initObject.textDiv);
        this.tmpData.text = this.editingObject.textbox.value;
        this.updateData(this.tmpData);
    },
    updateData: function(newData) {
        if (!!newData) {
            delete(this.cell.data);
            this.cell.data = newData;
            this.initObject.textDiv.innerHTML = newData.text;
        }
        this.editingObject.textbox.value = "";
        this.tmpData = {};
        this.etcl.dom.html.appendChild(this.initObject.textDiv);
    },
    editFocus: function() {
        this.editingObject.textbox.focus();
    }

    // Custom Function for textbox.
}