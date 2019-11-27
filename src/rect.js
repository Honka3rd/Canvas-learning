import React, { Component } from "react";
import $ from "jquery";
import { Button } from "semantic-ui-react";

const LABEL = "click Anywhere to erase";

class Rect extends Component {
	constructor() {
		super();
		this.cvs = null;
		this.context = null;

        // async load resource need to be defined in constructor or componentDidMount
		this.img = new Image();
		this.img.src = "./logo192.png";
		this.img.width = 30;
		this.img.height = 30;
	}

	componentDidMount() {
		this.cvs = $("#rect")[0];
		this.context = this.cvs.getContext("2d");
		const ctx = this.context;
		// start stroke
		// service attributes for strokeRect
		this.context.lineJoin = "round"; // rounded corners of a border
		this.context.lineWidth = 30;
		this.context.font = "24px Helvetica";
		this.context.strokeStyle = "goldenrod";
		this.context.save();
		// draw a border for rectangle
		this.context.strokeRect(
			this.cvs.width / 2 - 100,
			this.cvs.height / 2 - 100,
			200,
			200
		);
		// end stroke

		// start fill Rect
		// params: x1, y1, x2, y2
		const gradient = this.context.createLinearGradient(0, 0, this.cvs.width, 0);
		gradient.addColorStop(0, "blue");
		gradient.addColorStop(0.25, "white");
		gradient.addColorStop(0.5, "burlywood");
		gradient.addColorStop(0.75, "red");
		gradient.addColorStop(1, "yellow");
		this.context.fillStyle = gradient;
		// parms: x, y, width, height
		this.context.fillRect(
			this.cvs.width / 2 - 100,
			this.cvs.height / 2 - 100,
			200,
			200
		);
		// end fill rect

		// start fill text
		const coordTxt = this.context.measureText(LABEL);
		this.context.restore(); // restore the fill color from burlywood to default
		// parms: content:string, 
		this.context.fillText(
			LABEL,
			this.cvs.width / 2 - coordTxt.width / 2,
			this.cvs.height / 5
		);
		// end fill text
		this.radialGradient(this.context);
		/* this.img.onload = () => {
			this.addPattern("repeat");
		}; */
	}

	radialGradient = (context) => {
		const ctx = context;
		// parms: start coords:(x1, y1) & start pixel num & end coords: (x2, y2) & end pixel num
		const radial = ctx.createRadialGradient(
			this.cvs.width / 2,
			this.cvs.height,
			1,
			this.cvs.width / 2,
			this.cvs.height * 0.75,
			100
		);
		radial.addColorStop(0, "purple");
		radial.addColorStop(0.25, "teal");
		radial.addColorStop(0.5, "blue");
		radial.addColorStop(0.75, "silver");
		radial.addColorStop(1, "antiquewhite");
		ctx.fillStyle = radial;
		ctx.fillRect(
			this.cvs.width / 2 - 150,
			this.cvs.height * 0.75,
			300,
			this.cvs.height * 0.75
		);
	};

	addPattern = (type) => {
		this.context.clearRect(0, 0, this.cvs.width, this.cvs.height);
		const pattern = this.context.createPattern(this.img, type);
		this.context.fillStyle = pattern;
		this.context.fillRect(0, 0, this.cvs.width, this.cvs.height);
	};

	repeat = () => {
		this.addPattern("repeat");
	};

	repeatX = () => {
		this.addPattern("repeat-x");
	};

	repeatY = () => {
		this.addPattern("repeat-y");
	};

	repeatNone = () => {
		this.addPattern("no-repeat");
	};

	clear = () => {
		const ctx = this.cvs.getContext("2d");
		// parms: double x, double y, double width, double height
		// edit area is the whole canvas by default
		ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
	};

	render() {
		const style = {
			canvas: {
				border: "thin solid #aaaaaa",
				padding: "5%",
				marginLeft: "auto",
				marginRight: "auto",
				marginTop: "0",
				display: "block"
			}
		};
		return (
			<div>
				<canvas
					width='800'
					height='600'
					style={style.canvas}
					id='rect'
					onMouseDown={this.clear}>
					canvas not supported
				</canvas>
				<Button.Group attached='bottom'>
					<Button onMouseDown={this.repeat}>repeat</Button>
					<Button onMouseDown={this.repeatX}>repeat x</Button>
					<Button onMouseDown={this.repeatY}>repeat y</Button>
					<Button onMouseDown={this.repeatNone}>no repeat</Button>
				</Button.Group>
			</div>
		);
	}
}

export default Rect;
