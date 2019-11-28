import React, { Component } from "react";
import $ from "jquery";
import {
	Menu,
	Select,
	Checkbox,
	Segment,
	Button,
	Popup
} from "semantic-ui-react";
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

const shapes = [
	{ key: "rect", value: "rectangle", text: "Rectangle" },
	{ key: "arc", value: "circle", text: "Circle" }
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
		this.shape = shapes[0].value;
		this.guide = false;
		this.onLeave = false;
		this.histImgs = [];
		this.recoverImgs = [];
		this.state = {
			disableUndo: this.histImgs.length === 0,
			disableRedo: this.recoverImgs.length === 0
		};
	}

	componentDidMount() {
		this.canvas = $("#cvs")[0];
		this.context = this.canvas.getContext("2d");
		this.context.lineWidth = 2;
		// line head style
		this.context.lineCap = "round";
		// joint of lines style
		this.context.lineJoin = "round";
		this.context.save();
		this.createGrid();
		this.histImgs.push(this.context.getImageData(0, 0, WIDTH, HEIGHT));
	}

	shouldComponentUpdate(nextProp, nextState) {
		if (
			this.state.disableUndo === nextState.disableUndo &&
			this.state.disableRedo === nextState.disableRedo
		) {
			return false;
		}
		return true;
	}

	createGrid = () => {
		const context = $("#cvs")[0].getContext("2d");

		context.lineWidth = GRID_LINE_WIDTH;
		// CREATE HORIZONTAL
		for (let x = 1; x < HORIZONTAL_TICK_NUMBER; x++) {
			context.beginPath();
			context.moveTo(x * HORIZONTAL_TICK_WIDTH, 0);
			context.lineTo(x * HORIZONTAL_TICK_WIDTH, HEIGHT);
			context.stroke();
		}

		// CREATE VERTICAL
		for (let y = 1; y < VERTICAL_TICK_NUMBER; y++) {
			context.beginPath();
			context.moveTo(0, y * VERTICAL_TICK_HEIGHT);
			context.lineTo(WIDTH, y * VERTICAL_TICK_HEIGHT);
			context.stroke();
		}
		context.strokeStyle = "gray";
		context.closePath();
		context.restore();
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
		const context = $("#cvs")[0].getContext("2d");
		this.drawingSurfaceImageData = context.getImageData(0, 0, WIDTH, HEIGHT);
	}

	// apply the saved image
	restoreDrawingSurface = () => {
		const context = $("#cvs")[0].getContext("2d");
		// everytime replace the old place with the new one
		if (this.drawingSurfaceImageData)
			context.putImageData(this.drawingSurfaceImageData, 0, 0);
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
		const context = $("#cvs")[0].getContext("2d");
		context.beginPath();

		this.createDashLine(
			context,
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

		if (this.guide && this.onLeave === false) {
			this.strokeRubberbandLine(loc);
		}
		if (this.shape === "rectangle") {
			this.createRect(loc);
		} else if (this.shape === "circle") {
			this.createArc(loc);
		}
	};

	// stroke rect based on rubberband rectangle size and coordinates
	createRect = (loc) => {
		const context = $("#cvs")[0].getContext("2d");

		context.strokeStyle = this.color;
		context.beginPath();
		context.moveTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		context.lineTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		context.moveTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		context.lineTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		context.moveTo(
			this.RubberbandRect.left + this.RubberbandRect.width,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		context.lineTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		context.moveTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top -
				this.RubberbandRect.height +
				Math.abs(loc.y - this.mousedown.y)
		);
		context.lineTo(
			this.RubberbandRect.left,
			this.RubberbandRect.top + Math.abs(loc.y - this.mousedown.y)
		);
		context.stroke();
	};

	createArc = (loc) => {
		const context = $("#cvs")[0].getContext("2d");

		context.strokeStyle = this.color;
		context.beginPath();

		const radius =
			Math.floor(
				Math.sqrt(
					Math.pow(Math.abs(loc.x - this.mousedown.x), 2) +
						Math.pow(Math.abs(loc.y - this.mousedown.y), 2)
				)
			) / 2;

		const x = loc.x - (loc.x - this.mousedown.x) / 2;
		const y = loc.y - (loc.y - this.mousedown.y) / 2;
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.stroke();
	};

	// Event listener and action perform
	onCanvasClick = (e) => {
		this.onLeave = false;
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
			this.onLeave = true;
			e.preventDefault();
			const loc = this.mapWindowToCanvas(e.clientX, e.clientY);
			this.updateRubberbandTogether(loc);
			this.saveDrawingSurface();
			this.restoreDrawingSurface();
			this.dragging = false;
			this.histImgs.push(this.drawingSurfaceImageData);
		}

		this.setState({ disableUndo: false });
	};

	onColorChange = (e, { value }) => {
		e.preventDefault();
		this.color = value;
	};

	onShapeChange = (e, { value }) => {
		e.preventDefault();
		this.shape = value;
	};

	onToggleGuild = (e) => {
		e.preventDefault();
		this.guide = !this.guide;
	};

	undo = () => {
		const context = $("#cvs")[0].getContext("2d");

		if (this.histImgs.length > 1) {
			this.recoverImgs.push(this.histImgs.pop());
			context.putImageData(this.histImgs[this.histImgs.length - 1], 0, 0);
			this.drawingSurfaceImageData = this.histImgs[this.histImgs.length - 1];
			this.setState({ disableRedo: false });
			if (this.histImgs.length === 1) {
				this.setState({ disableUndo: true });
			}
		}
	};

	redo = () => {
		const context = $("#cvs")[0].getContext("2d");
		if (this.recoverImgs.length) {
			context.putImageData(this.recoverImgs[this.recoverImgs.length - 1], 0, 0);
			this.drawingSurfaceImageData = this.recoverImgs[
				this.recoverImgs.length - 1
			];
			this.histImgs.push(this.recoverImgs.pop());
			if (!this.recoverImgs.length) {
				this.setState({ disableRedo: true });
			}
		}
	};

	clear = () => {
		const context = $("#cvs")[0].getContext("2d");
		context.closePath();
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		context.lineWidth = 2;
		
		context.putImageData(this.histImgs[0], 0, 0);
		this.histImgs.push(context.getImageData(0, 0, WIDTH, HEIGHT));

		this.drawingSurfaceImageData = this.histImgs[0];

		if (this.histImgs.length > 1 && this.onLeave) {
			this.setState({ disableUndo: false });
		}

		if (this.recoverImgs.length) {
			this.setState({ disableRedo: false });
		}
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
						<Select
							placeholder='Shape type'
							options={shapes}
							onChange={this.onShapeChange}
						/>
					</Menu.Item>
					<Menu.Item>
						<Segment compact>
							<Popup
								trigger={<Checkbox toggle onClick={this.onToggleGuild} />}
								content={`Guidewire`}
								style={{ opacity: 0.7 }}
							/>
						</Segment>
					</Menu.Item>
					<Menu.Item>
						<Popup
							trigger={
								<Button
									icon='redo'
									onClick={this.redo}
									disabled={this.state.disableRedo}
								/>
							}
							content='Redo'
							style={{ opacity: 0.7 }}
						/>
					</Menu.Item>
					<Menu.Item>
						<Popup
							trigger={
								<Button
									icon='undo'
									onClick={this.undo}
									disabled={this.state.disableUndo}
								/>
							}
							content='Undo'
							style={{ opacity: 0.7 }}
						/>
					</Menu.Item>
					<Menu.Item>
						<Popup
							trigger={
								<Button
									icon='eraser'
									negative
									onClick={(e) => {
										e.preventDefault();
										this.clear();
									}}></Button>
							}
							content='Clear all'
							style={{ opacity: 0.7 }}
						/>
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
