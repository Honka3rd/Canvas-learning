import React, { Component } from "react";
import $ from "jquery";
import { Menu, Select, Checkbox, Segment, Button } from "semantic-ui-react";
import _ from "lodash";

const WIDTH = 800;
const HEIGHT = 800;

const options = [
	{ key: "red", value: "red", text: "Red" },
	{ key: "green", value: "green", text: "Green" },
	{ key: "blue", value: "blue", text: "Blue" },
	{ key: "orange", value: "orange", text: "Orange" },
	{ key: "purple", value: "purple", text: "Purple" }
];

const HORIZONTAL_TICK_WIDTH = 10;
const VERTICAL_TICK_HEIGHT = 10;
const HORIZONTAL_TICK_NUMBER = WIDTH / HORIZONTAL_TICK_WIDTH;
const VERTICAL_TICK_NUMBER = HEIGHT / VERTICAL_TICK_HEIGHT;
const GRID_LINE_WIDTH = 0.5;
const DASHLENGTH = 5;

class RubberLine extends Component {
	constructor() {
		super();
		this.canvas = null;
		this.context = null;
		this.drawingSurfaceImageData = null;
		this.RubberbandRect = {
			width: 0,
			height: 0,
			left: 0,
			top: 0
		};
		this.mousedown = {
			x: 0,
			y: 0
		};
		this.dragging = false;

		this.color = options[0].value;
		this.guide = false;
	}

	componentDidMount() {
		this.canvas = $("#cvs")[0];
		this.context = this.canvas.getContext("2d");
		this.context.lineWidth = 2;
		this.context.save();
		this.createGrid();
	}

	createGrid = () => {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}
		this.context.lineWidth = GRID_LINE_WIDTH;
		// CREATE HORIZONTAL
		for (let x = 1; x < HORIZONTAL_TICK_NUMBER; x++) {
			this.context.beginPath();
			this.context.moveTo(x * HORIZONTAL_TICK_WIDTH, 0);
			this.context.lineTo(x * HORIZONTAL_TICK_WIDTH, HEIGHT);
			this.context.stroke();
		}

		// CREATE VERTICAL
		for (let y = 1; y < VERTICAL_TICK_NUMBER; y++) {
			this.context.beginPath();
			this.context.moveTo(0, y * VERTICAL_TICK_HEIGHT);
			this.context.lineTo(WIDTH, y * VERTICAL_TICK_HEIGHT);
			this.context.stroke();
		}
		this.context.strokeStyle = "gray";
		this.context.closePath();
		this.context.restore();
	};

	// return the currect coordinates relative to canvas
	mapWindowToCanvas = (clientX, clientY) => {
		const bbox = this.canvas.getBoundingClientRect();
		return {
			x: (clientX - bbox.left) * (bbox.width / this.canvas.width),
			y: (clientY - bbox.top) * (bbox.height / this.canvas.height)
		};
	};

	// save and restore drawing surface
	saveDrawingSurface() {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}
		this.drawingSurfaceImageData = this.context.getImageData(
			0,
			0,
			WIDTH,
			HEIGHT
		);
	}

	// apply the saved image
	restoreDrawingSurface = () => {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}
		// everytime replace the old place with the new one
		if (this.drawingSurfaceImageData)
			this.context.putImageData(this.drawingSurfaceImageData, 0, 0);
	};

	// OPERATE RUBBERBANDS:
	// dynamically change rubberband rectangle size
	updateRubberbandRect = (loc) => {
		this.RubberbandRect.width = Math.abs(loc.x - this.mousedown.x);
		this.RubberbandRect.height = Math.abs(loc.y - this.mousedown.y);

		this.RubberbandRect.left =
			loc.x < this.mousedown.x ? loc.x : this.mousedown.x;

		this.RubberbandRect.top =
			loc.y < this.mousedown.y ? loc.y : this.mousedown.y;
	};

	// dynamically stroke rubberband line
	strokeRubberbandLine = (loc) => {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}
		this.context.beginPath();

		this.createDashLine(
			this.context,
			this.mousedown.x,
			loc.x,
			this.mousedown.y,
			loc.y
		);
	};

	createDashLine = (context, x1, x2, y1, y2) => {
		// may be a negative number, because dragging upward
		const deltaX = x2 - x1;
		const deltaY = y2 - y1;
		const dashNum = Math.floor(
			Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) / DASHLENGTH
		);
		context.moveTo(x1, y1);
		for (let i = 0; i < dashNum; i++) {
			/* if (i % 2 === 0) {
				context.lineTo(
					x1 + (deltaX / dashNum) * i,
					y1 + (deltaY / dashNum) * i
				);
			} else {
				context.moveTo(
					x1 + (deltaX / dashNum) * i,
					y1 + (deltaY / dashNum) * i
				);
			} */
			context[i % 2 === 0 ? "lineTo" : "moveTo"](
				x1 + (deltaX / dashNum) * i,
				y1 + (deltaY / dashNum) * i
			);
		}
		context.stroke();
	};

	updateRubberbandTogether = (loc) => {
		this.restoreDrawingSurface();
		this.saveDrawingSurface();
		this.updateRubberbandRect(loc);

		if (this.guide) {
			this.strokeRubberbandLine(loc);
		}

		this.createGuidewire(loc);
	};

	// stroke rect based on rubberband rectangle size and coordinates
	createGuidewire = (loc) => {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}

		this.context.strokeStyle = this.color;
		this.context.beginPath();
		this.context.moveTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		this.context.lineTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		this.context.moveTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		this.context.lineTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		this.context.moveTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		this.context.lineTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		this.context.moveTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		this.context.lineTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		this.context.stroke();
	};

	// Event listener and action perform
	onCanvasClick = (e) => {
		e.preventDefault();
		const loc = this.mapWindowToCanvas(e.clientX, e.clientY);
		this.dragging = true;
		this.mousedown.x = loc.x;
		this.mousedown.y = loc.y;
	};

	onCanvasMouseMove = _.debounce((clientX, clientY) => {
		if (this.dragging) {
			const loc = this.mapWindowToCanvas(clientX, clientY);
			this.updateRubberbandTogether(loc);
		}
	}, 5);

	onCanvasMouseLeave = (e) => {
		if (this.dragging) {
			e.preventDefault();
			e.persist();
			const loc = this.mapWindowToCanvas(e.clientX, e.clientY);
			// update the picture in the last frame and repaint the previous shapes
			this.restoreDrawingSurface();
			// update rect shape
			this.updateRubberbandRect(loc);
			// stroke rect shape
			this.createGuidewire(loc);
			// every time save the previous shapes
			this.saveDrawingSurface();
			this.dragging = false;
		}
	};

	onColorChange = (e, { value }) => {
		e.preventDefault();
		this.color = value;
	};

	onToggleGuild = (e) => {
		e.preventDefault();
		this.guide = !this.guide;
	};

	clear = () => {
		if (!this.context) {
			this.context = $("#cvs")[0].getContext("2d");
		}

		this.context.restore();
		this.context.closePath();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.createGrid();
		this.createGrid();
		this.saveDrawingSurface();
		this.restoreDrawingSurface();
		this.context.lineWidth = 2;
	};

	render() {
		const style = {
			container: {
				marginLeft: window.innerWidth / 2 - WIDTH / 2,
				marginRight: window.innerWidth / 2 - WIDTH / 2,
				marginTop: "1%"
			},
			canvas: {
				border: "thin solid #aaaaaa",
				marginLeft: 0,
				marginRight: 0,
				display: "block"
			}
		};

		return (
			<div style={style.container}>
				<Menu inverted>
					<Menu.Item>
						<Select
							placeholder='Stroke color'
							options={options}
							onChange={this.onColorChange}
						/>
					</Menu.Item>
					<Menu.Item>
						<Segment compact>
							<Checkbox
								toggle
								label='Guidewires'
								onClick={this.onToggleGuild}
							/>
						</Segment>
					</Menu.Item>
					<Menu.Item>
						<Button
							negative
							onClick={(e) => {
								e.preventDefault();
								this.clear();
								this.clear();
							}}>
							Erase All
						</Button>
					</Menu.Item>
				</Menu>
				<canvas
					id='cvs'
					style={style.canvas}
					width={WIDTH}
					height={HEIGHT}
					onMouseDown={this.onCanvasClick}
					onMouseMove={(e) => {
						e.preventDefault();
						this.onCanvasMouseMove(e.clientX, e.clientY);
					}}
					onMouseUp={this.onCanvasMouseLeave}>
					Canvas not supported
				</canvas>
			</div>
		);
	}
}

export default RubberLine;
