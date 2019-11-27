import React, { Component } from "react";
import $ from "jquery";

const SHADOW_COLOR = "rgba(0,0,0,0.7)";
const ERASER_LINE_WIDTH = 1;
const ERASER_SHADOW_STYLE = "blue";
const ERASER_STROKE_STYLE = "rgba(0,0,255,0.6)";
const ERASER_SHADOW_OFFSET = -5;
const ERASER_SHADOW_BLUR = 20;
const ERASER_RADIUS = 60;

class Shadow extends Component {
	constructor() {
		super();
		this.cvs = null;
		this.ctx = null;
		this.dragging = false;
	}

	componentDidMount() {
		this.cvs = $("#shadow")[0];
		this.ctx = this.cvs.getContext("2d");
        this.drawRect(this.cvs, this.ctx);
        
        // clear all subpaths and start a new path
        this.ctx.beginPath();
        // create a subpath with 4 points
        this.ctx.rect(0,0, 100, 100);
        this.ctx.stroke();

        // without this clear statement, the first rect will be painted again
        this.ctx.beginPath();
        this.ctx.rect(this.cvs.width-100, 0, 100, 100)
        this.ctx.stroke();
	}

	drawRect = (canvas, context) => {
		context.save();
		const rectW = 400;
		const rectH = 400;
		const gradient = context.createLinearGradient(0, 0, rectW, rectH);
		gradient.addColorStop(0, "blue");
		gradient.addColorStop(0.25, "white");
		gradient.addColorStop(0.5, "burlywood");
		gradient.addColorStop(0.75, "red");
		gradient.addColorStop(1, "yellow");
		context.fillStyle = gradient;
		context.shadowColor = SHADOW_COLOR;
		context.shadowOffsetX = 5;
		context.shadowOffsetY = 5;
		context.shadowBlur = 2;
		context.fillRect(
			canvas.width / 2 - rectW / 2,
			canvas.height / 2 - rectH / 2,
			rectW,
			rectH
		);
		context.restore();
	};

	setEraserAttrs = (context) => {
		context.lineWidth = ERASER_LINE_WIDTH;
		context.shadowColor = ERASER_SHADOW_STYLE;
		context.shadowOffsetX = ERASER_SHADOW_OFFSET;
		context.shadowOffsetY = ERASER_SHADOW_OFFSET;
		context.shadowBlur = ERASER_SHADOW_BLUR;
		context.strokeStyle = ERASER_STROKE_STYLE;
		context.fillStyle = "white";
	};

	drawEraser = (context, loc) => {
		context.save();
        this.setEraserAttrs(context);
        
        // clear all subpaths from the current path
		context.beginPath();
        context.arc(loc.x, loc.y, ERASER_RADIUS, 0, Math.PI * 2, false);
        // restrict the painting area inside this arc
		//context.clip();
		context.stroke();
        context.fill();
        context.closePath();
	};

	moveEraser = (context, loc) => {
		context.beginPath();
		context.arc(loc.x, loc.y, ERASER_RADIUS, 0, Math.PI * 2, false);
		//context.clip();
		context.stroke();
        context.fill();
        context.closePath();
	};

	moveEnd = (context) => {
		context.restore();
		this.dragging = false;
	};

	onCanvasClick = (e) => {
        e.preventDefault();
        this.dragging = !this.dragging;
		const bbox = this.cvs.getBoundingClientRect();
		this.drawEraser(this.ctx, {
			x: e.clientX - bbox.left,
			y: e.clientY - bbox.top
        });
	};

	onCanvasMove = (e) => {
		e.preventDefault();
		if (this.dragging === true) {
			const bbox = this.cvs.getBoundingClientRect();
			this.moveEraser(this.ctx, {
				x: e.clientX - bbox.left,
				y: e.clientY - bbox.top
			});
		}
	};

	onCanvasMoveEnd = (e) => {
        e.preventDefault();
		this.moveEnd(this.ctx);
	};

	render() {
		const style = {
			canvas: {
				marginTop: "5%",
				marginLeft: "auto",
				marginRight: "auto",
				display: "block",
				border: "solid thin #aaaaaa"
			}
		};
		return (
			<div>
				<canvas
					id='shadow'
					style={style.canvas}
					width='800'
					height='800'
					onMouseDown={this.onCanvasClick}
					onMouseMove={this.onCanvasMove}
					onMouseLeave={this.onCanvasMoveEnd}>
					Canvas not surported
				</canvas>
			</div>
		);
	}
}
export default Shadow;
