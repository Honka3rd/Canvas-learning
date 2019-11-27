import React, { Component } from "react";
import $ from "jquery";

const HORIZONTAL_TICK_SPACE = 10;
const VERTICAL_TICK_SPACE = 10;
const AXIS_MARGIN = 40;
const AXIS_ORIGIN = {
	x: AXIS_MARGIN,
	y: 0
};
const AXIS_TOP = AXIS_MARGIN;
let AXIS_RIGHT = 0;
let AXIS_WIDTH = 0;
let AXIS_HEIGHT = 0;

const TICK_WIDTH = 10;
const TICKL_INEWIDTH = 0.5;
const TICK_COLOR = "navy";

const AXIS_LINEWIDTH = 1;
const AXIS_COLOR = "blue";
let NUM_HORIZONTAL_TICKS = 0;
let NUM_VERTICAL_TICKS = 0;

class GridAxis extends Component {
	componentDidMount() {
		const cvs = $("#cvs")[0];
		const ctx = cvs.getContext("2d");
		ctx.save();

		AXIS_ORIGIN.y = cvs.height - AXIS_MARGIN;
		AXIS_RIGHT = cvs.width - AXIS_MARGIN;
		AXIS_WIDTH = cvs.width - 2 * AXIS_MARGIN;
		AXIS_HEIGHT = cvs.height - 2 * AXIS_MARGIN;
		NUM_HORIZONTAL_TICKS = AXIS_WIDTH / TICK_WIDTH;
		NUM_VERTICAL_TICKS = AXIS_HEIGHT / TICK_WIDTH;

		this.createGrid(
			ctx,
			"lightgray",
			HORIZONTAL_TICK_SPACE,
			VERTICAL_TICK_SPACE
		);

		this.createAxis(ctx);
	}

	createGrid = (context, color, stepx, stepy) => {
		context.strokeStyle = color;
		for (let x = 0; x < context.canvas.width; x += stepx) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, context.canvas.height);
			context.stroke();
		}

		for (let y = 0; y < context.canvas.height; y += stepy) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(context.canvas.width, y);
			context.stroke();
		}
		context.closePath();
		context.restore();
	};

	createAxis = (context) => {
		context.strokeStyle = AXIS_COLOR;
		context.lineWidth = AXIS_LINEWIDTH;
		this.createHorizontalAxis(context);
		this.createVerticalAxis(context);
		this.createHorizontalTicks(context);
		this.createVerticalTicks(context);
		context.closePath();
	};

	createHorizontalAxis = (context) => {
		context.beginPath();
		context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
		context.lineTo(AXIS_RIGHT, AXIS_ORIGIN.y);
		context.stroke();
	};

	createVerticalAxis = (context) => {
		context.beginPath();
		context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
		context.lineTo(AXIS_ORIGIN.x, AXIS_TOP);
		context.stroke();
	};

	createHorizontalTicks = (context) => {
		let tickHeight = TICK_WIDTH;
		for (let x = 1; x < NUM_HORIZONTAL_TICKS; x++) {
			x % 5 === 0 ? (tickHeight = TICK_WIDTH * 2) : (tickHeight = TICK_WIDTH);
			context.beginPath();
			context.moveTo(AXIS_ORIGIN.x + HORIZONTAL_TICK_SPACE * x, AXIS_ORIGIN.y);
			context.lineTo(
				AXIS_ORIGIN.x + HORIZONTAL_TICK_SPACE * x,
				AXIS_ORIGIN.y - tickHeight
			);
			context.stroke();
		}
	};

	createVerticalTicks = (context) => {
		let tickLength = TICK_WIDTH;
		for (let y = 1; y < NUM_VERTICAL_TICKS; y++) {
			y % 5 === 0
				? (tickLength = TICK_WIDTH * 2)
				: (tickLength = TICK_WIDTH);
			context.beginPath();
			context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y - y * VERTICAL_TICK_SPACE);
			context.lineTo(
				AXIS_ORIGIN.x + tickLength,
				AXIS_ORIGIN.y - y * VERTICAL_TICK_SPACE
			);
            context.stroke();
		}
	};

	render() {
		const style = {
			canvas: {
				border: "thin solid #aaaaaa",
				marginLeft: "auto",
				marginRight: "auto",
				marginTop: "5%",
				display: "block"
			}
		};
		return (
			<div>
				<canvas style={style.canvas} width='800' height='800' id='cvs'></canvas>
			</div>
		);
	}
}

export default GridAxis;
