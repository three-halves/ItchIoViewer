import { UI } from "./UI.js";

export class Popup extends UI {
    constructor(title, template) {
        super(template);
        this.template = template;
        this.title = title;

        // create popup html structure
        this.popup = document.createElement('div')
        this.popup.classList.add("popup");
        this.popupBox = document.createElement('fieldset');
        this.popupTitle = document.createElement('legend');
        this.closeButton = document.createElement('button');
        this.closeButton.innerHTML = "X";
        this.popupTitle.appendChild(this.closeButton);
        
        this.popupTitleLabel = document.createElement('label');
        this.popupTitleLabel.innerHTML = title;
        this.popupTitle.appendChild(this.popupTitleLabel);
        this.popupTitle.classList.add("popup-title-bar");
        this.popupContent = document.createElement('div');

        this.popupBox.appendChild(this.popupTitle);
        this.popupBox.appendChild(this.popupContent);
        this.popup.appendChild(this.popupBox);

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        this.closeButton.addEventListener("click", this.close);

        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);

        this.popupTitleLabel.addEventListener("mousedown", this.mouseDownHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
        document.addEventListener("mousemove", this.mouseMoveHandler);

        this.isDragging = false;
        this.dragOffset = [0, 0];
    }

    open() {
        document.body.appendChild(this.popup);
    }

    close() {
        this.popup.remove();
    }

    render(params) {
        this.popupContent.innerHTML = super.render(params);
    }

    mouseDownHandler(e) {
        e.preventDefault();
        this.isDragging = true;
        this.dragOffset = {x: e.clientX, y: e.clientY};
    }

    mouseUpHandler(e) {
        this.isDragging = false;
    }

    mouseMoveHandler(e) {
        if (!this.isDragging) return;
        this.popup.style.top = (this.popup.offsetTop - (this.dragOffset.y - e.clientY)) + "px";
        this.popup.style.left = (this.popup.offsetLeft - (this.dragOffset.x - e.clientX)) + "px";
        this.dragOffset = {x: e.clientX, y: e.clientY};
    }
}