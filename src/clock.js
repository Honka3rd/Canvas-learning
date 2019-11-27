import React, { Component } from "react";
import $ from "jquery";
import { Message } from "semantic-ui-react";

const FONT_HEIGHT = 15;
const MARGIN = 35;

// length of minute hand and second hand
let HAND_TRUNCATION = 0;

// length of hour hand
let HOUR_HAND_TRUNCATION = 0;
const NUMERAL_SPACING = 20;
let RADIUS = 0;
let HAND_RADIUS = 0;
const numerals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

class Clock extends Component {
	constructor() {
		super();
		this.canvas = null;
		this.state = {
			isAm: true,
			src: "",
		};
		this.loop = null;
	}

	componentDidMount() {
		this.canvas = $("#cvs")[0];
		HAND_TRUNCATION = this.canvas.width / 25;
		HOUR_HAND_TRUNCATION = this.canvas.width / 10;
		RADIUS = this.canvas.width / 2 - MARGIN;
		HAND_RADIUS = RADIUS + NUMERAL_SPACING;
		const context = this.canvas.getContext("2d");
		context.font = FONT_HEIGHT + "px Arial";
		this.loop = setInterval(() => {
			this.drawClock();
		}, 1000);
	}

	componentDidUpdate() {
		const imgW = $("#cvs").attr("width") + "px";
		const imgH = $("#cvs").attr("height") + "px";

		$("#snapshot").css("width", imgW);
		$("#snapshot").css("height", imgH);
		$("#snapshot").css("left", this.canvas.getBoundingClientRect().left);
		$("#snapshot").css("top", this.canvas.getBoundingClientRect().top);
	}

	componentWillUnmount() {
		clearInterval(this.loop);
	}

	drawCircle = () => {
		const cvs = this.canvas;
		const context = cvs.getContext("2d");
		context.beginPath();
		context.arc(cvs.width / 2, cvs.height / 2, RADIUS, 0, Math.PI * 2, true);
		context.stroke();
	};

	drawNumerals = () => {
		const cvs = this.canvas;
		const context = cvs.getContext("2d");
		let angle = 0;
		let numeralWidth = 0;
		numerals.forEach((numeral) => {
			// start at -60 degree, points to 1 AM/PM
			// right axis-x: starts from 0 dgree
			// Second quadrant: -90 to 0
			// third quadrant: 0 to 90
			// see details: @ ../notes/angle_change.png
			angle = (Math.PI / 6) * (numeral - 3);

			// auto detect text size
			numeralWidth = context.measureText(numeral).width;

			// see why use sin cos: @ ../notes/angle_change.png
			context.fillText(
				numeral,
				cvs.width / 2 + Math.cos(angle) * HAND_RADIUS - numeralWidth / 2,
				cvs.height / 2 + Math.sin(angle) * HAND_RADIUS + FONT_HEIGHT / 3
			);
		});
	};

	drawCenter = () => {
		const cvs = this.canvas;
		const context = cvs.getContext("2d");
		context.beginPath();
		context.arc(cvs.width / 2, cvs.height / 2, 5, 0, Math.PI * 2, true);
		context.fill();
	};

	drawHand = (pointerLoc, isHour) => {
		const cvs = this.canvas;
		const context = cvs.getContext("2d");
		// pointerLoc refers to the y-axis
		// angle refers to x-axis
		// eg: 1 am/pm -> pointerLoc: 30/axis-y -> angle: -60/axis-x
		const angle = Math.PI * 2 * (pointerLoc / 60) - Math.PI / 2;
		const handRadius = isHour ? HOUR_HAND_TRUNCATION : HAND_RADIUS;
		context.moveTo(
			cvs.width / 2 + handRadius * Math.cos(angle),
			cvs.height / 2 + handRadius * Math.sin(angle)
		);

		context.lineTo(cvs.width / 2, cvs.height / 2);
		context.stroke();
	};

	drawHands = () => {
		const date = new Date();
		let hour = date.getHours();

		if (hour < 12) {
			this.setState({ isAm: true });
		} else {
			hour = hour - 12;
			this.setState({ isAm: false });
		}

		const minutes = date.getMinutes();
		// draw hour hand
		// 12 h maps to 60 units in clock
		// min converts to hour, then * 5
		this.drawHand(hour * 5 + (minutes / 60) * 5, true);

		// draw minute hand
		this.drawHand(minutes, false);

        // draw second hand
        this.drawHand(date.getSeconds(), false);
    };
    
	updateClockImg = () => {
		this.setState({ src: this.canvas.toDataURL() });
	};

	drawClock = () => {
		const cvs = this.canvas;
		const context = cvs.getContext("2d");
		context.clearRect(0, 0, cvs.width, cvs.height);

		context.save();
		this.drawCircle();
		this.drawCenter();
		this.drawHands();
		context.restore();

		this.drawNumerals();
		this.updateClockImg();
	};

	render() {
		return (
			<div>
				<Message>
					<Message.Header>
						{this.state.isAm ? "A.M.  上午" : "P.M.  下午"}
					</Message.Header>
				</Message>
				<img
					id='snapshot'
					src={this.state.src}
					style={{
						position: "absolute",
						display: "inline"
					}}
				/>
				<canvas
					id='cvs'
					width='800'
					height='800'
					onMouseDown={this.onCanvasClick}
					style={{
						border: "thin solid #aaaaaa",
						padding: "0",
						marginLeft: "auto",
						marginRight: "auto",
						marginTop: "0",
						display: "block"
					}}>
					Canvas not supported
				</canvas>
			</div>
		);
	}
}

export default Clock;
