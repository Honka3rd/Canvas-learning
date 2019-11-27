import React, { Component } from "react";
import $ from "jquery";
import _ from "lodash";
import { Button } from "semantic-ui-react";

class Canvas extends Component {
	constructor() {
		super();
		this.state = {
			height: window.innerHeight / 2,
			width: window.innerWidth / 2
		};
		this.ctx = null;
	}

	componentDidMount() {
		const cvs = $(".clockContainer")[0];
		this.ctx = cvs.getContext("2d");
		const bbox = cvs.getBoundingClientRect();

		let borderlf = $(cvs).css("border-left-width");
		let bordertp = $(cvs).css("border-top-width");
		let borderlfarr = borderlf.split("");
		borderlfarr.pop();
		borderlfarr.pop();
		let bordertparr = bordertp.split("");
		bordertparr.pop();
		bordertparr.pop();

		borderlf = +borderlfarr.join("");
		bordertp = +bordertparr.join("");

		let cvswt = $(cvs).css("width");
		let cvswtarr = cvswt.split("");
		cvswtarr.pop();
		cvswtarr.pop();
		cvswt = +cvswtarr.join("");

		$(cvs).css("left", window.innerWidth / 2 - cvswt / 2 - borderlf);

		$(".glasspane").css({
			width: this.state.width + "px",
			height: this.state.height + "px",
			left: this.clearJQStr($(cvs).css("left")) + borderlf,
			top: bbox.top + bordertp
		});

		// it is useless to register a click event and prevent its default behaviour
		// to prevent default action of browser, register the onmousedown listener
		$(".glasspane")[0].addEventListener("onmousedown", (e) => {
			e.preventDefault();
			console.log("glasspane has been clicked");
		});
	}

	clearJQStr(str) {
		let arr = str.split("");
		arr.pop();
		arr.pop();
		return +arr.join("");
	}

	// get coordinate refer to canvas element
	// https://medium.com/trabe/react-syntheticevent-reuse-889cd52981b6
	clickHandler = (e) => {
		// Calling event.persist() on the synthetic event removes the event from the pool allowing references to the event to be retained asynchronously.
		e.persist();

		$(document).ready(() => {
			// get bounding box: a boundry of the canvas box
			const cvs = $(".clockContainer")[0];
			const bbox = cvs.getBoundingClientRect();
			this.printCoodinate(e.clientX, e.clientY, bbox, cvs, "on_click");
			return {
				x: (e.clientX - bbox.left) * (cvs.width / bbox.width),
				y: (e.clientY - bbox.top) * (cvs.height / bbox.height)
			};
		});
	};

	componentWillUnmount() {
		$(".glasspane")[0].removeEventListener("onmousedown");
	}

	printCoodinate(clientX, clientY, bbox, cvs, type) {
		console.clear();
		console.log(type);
		console.log("client x:", clientX);
		console.log("client y:", clientY);
		console.log("bbox left:", bbox.left);
		console.log("bbox top:", bbox.top);
		console.log("bbox height:", bbox.height);
		console.log("bbox width:", bbox.width);
		console.log("canvas width:", cvs.width);
		console.log("canvas height:", cvs.height);
		console.log("inner x", (clientX - bbox.left) * (cvs.width / bbox.width));
		console.log("inner y", (clientY - bbox.top) * (cvs.height / bbox.height));
	}

	debouncedMoveHandler = _.debounce((clientX, clientY) => {
		$(document).ready(() => {
			const cvs = $(".clockContainer")[0];
			const bbox = cvs.getBoundingClientRect();
			this.printCoodinate(clientX, clientY, bbox, cvs, "on_hover");
		});
	}, 300);

	canvasControlHandler = (e) => {
		//e.preventDefault();
		// if event propagation has not been stopped at upper level, prevent default at the lower level at onmousedown listener 
		console.log("this is a controller");
	};

	render() {
		const style = {
			glasspane: {
				background: "aliceblue",
				position: "absolute",
				zIndex: "10"
			},
			canvas: {
				marginLeft: "auto",
				marginRight: "auto",
				marginTop: "20%",
				display: "block",
				border: "solid",
				position: "absolute"
			}
		};
		return (
			<div>
				{/* if glasspane does not cover the canvas, change the order of the two elements, given both positions are absolute.
					the glasspane should be put in front of the canvas, if we want to add some control components, like button, to control animation playing.
					In this case, it is useless to add any click events on canvas, they will never be notified.
				 */}
				<div
					className='glasspane'
					style={{
						background: style.glasspane.background,
						position: style.glasspane.position,
						zIndex: style.glasspane.zIndex
					}}>
					<Button
						fluid
						style={{ position: "absolute", bottom: 0 }}
						onClick={this.canvasControlHandler}
						onMouseDown={(e) => e.stopPropagation()}>
						{/* use onmousedown listener to stop event propagation */}
						Click Here
					</Button>
				</div>
				<canvas
					className='clockContainer'
					height={this.state.height}
					width={this.state.width}
					onMouseDown={this.clickHandler}
					onMouseMove={({ clientX, clientY }) => {
						// store the event properties in the event handler and pass them to the asynchronous callback instead of accessing the event directly from the asynchronous callback
						this.debouncedMoveHandler(clientX, clientY);
					}}
					style={{
						marginLeft: style.canvas.marginLeft,
						marginRight: style.canvas.marginRight,
						marginTop: style.canvas.marginTop,
						display: style.canvas.display,
						border: style.canvas.border,
						position: style.canvas.position
					}}>
					Canvas not surported
				</canvas>
			</div>
		);
	}
}

export default Canvas;
