import React, { Component } from "react";
import $ from "jquery";
import { Button } from "semantic-ui-react";

class Rubber extends Component {
	constructor() {
		super();
		this.canvas = null;
		this.context = null;
		this.img = new Image();
		this.state = {
			rubberbandRectangle: {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				display: "none"
			},
			mousedown: { x: 0, y: 0 }
		};
		this.dragging = false;
		window.onmousemove = this.onDragging;
		window.onmouseup = this.onDragEnd;
		this.img.src = "./media/1200px-Route_66.jpg";
	}

	componentDidMount() {
		this.canvas = $("#cvs")[0];
		this.context = this.canvas.getContext("2d");
		document.body.style.background = "rgba(100, 145, 250, 0.3)";
		this.img.onload = this.loadImg;
	}

    // Functions
    // make rubberband visiable via changing JSX style
	showRubberband = () => {
		this.setState({
			rubberbandRectangle: {
				...this.state.rubberbandRectangle,
				display: "inline"
			}
		});
	};

    // hide rubberband
	hideRubberband = () => {
		this.setState({
			rubberbandRectangle: {
				...this.state.rubberbandRectangle,
				display: "none"
			}
		});
	};

    // make the rubberband invisiable
	resetRubberbandRectangle = () => {
		this.setState({
			rubberbandRectangle: {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				display: "none"
			}
		});
	};

    // get the first mousedown coordinates
    // set the start point of rubberband, via specifying left and top
    // start dragging
	rubberbandStart = (x, y) => {
		this.setState({ mousedown: { x, y } });
		this.setState({
			rubberbandRectangle: {
				...this.state.rubberbandRectangle,
				left: x,
				top: y
			}
		});
		this.dragging = true;
	};

    // dynamically change rubberband size by mouse moving 
	rubberbandStretch = (x, y) => {
        this.showRubberband();
        // change position
        // if current mouse position is smaller than initial mouse position
        // clientX in the leftside of initial position
        // clientX should be the left
		if (x < this.state.mousedown.x) {
			this.setState({
				rubberbandRectangle: { ...this.state.rubberbandRectangle, left: x }
			});
        } else
        // otherwise initial position in the leftside of current position
        // initial position should be the left
        {
			this.setState({
				rubberbandRectangle: {
					...this.state.rubberbandRectangle,
					left: this.state.mousedown.x
				}
			});
		}

		if (y < this.state.mousedown.y) {
			this.setState({
				rubberbandRectangle: { ...this.state.rubberbandRectangle, top: y }
			});
		} else {
			this.setState({
				rubberbandRectangle: {
					...this.state.rubberbandRectangle,
					top: this.state.mousedown.y
				}
			});
		}

        // change size
		this.setState({
			rubberbandRectangle: {
				...this.state.rubberbandRectangle,
				width: Math.abs(x - this.state.mousedown.x),
				height: Math.abs(y - this.state.mousedown.y)
			}
        });
	};

	rubberbandEnd = () => {
        const bbox = this.canvas.getBoundingClientRect();
        // ? context is unexpectedly emptied
        this.context = this.canvas.getContext("2d");
        // ?
		this.context.drawImage(
			this.canvas,
			this.state.rubberbandRectangle.left - bbox.left,
			this.state.rubberbandRectangle.top - bbox.top,
			this.state.rubberbandRectangle.width,
			this.state.rubberbandRectangle.height,
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		this.resetRubberbandRectangle();
		this.hideRubberband();
		this.dragging = false;
	};

	// event handlers
	onCanvasClick = (e) => {
		e.preventDefault();
		this.rubberbandStart(e.clientX, e.clientY);
	};

	onDragging = (e) => {
        // seems useless in this program
        // aim to prevent the mousemove event affect other DOM 
        // avoid potential unexpected behavior
		e.preventDefault();
		if (this.dragging) {
			this.rubberbandStretch(e.clientX, e.clientY);
		}
	};

	onDragEnd = (e) => {
		e.preventDefault();
		this.rubberbandEnd();
	};

	loadImg = () => {
		this.context.drawImage(
			this.img,
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
	};

	reset = () => {
		this.context = this.canvas.getContext("2d");
		this.context.clearRect(
			0,
			0,
			this.context.canvas.width,
			this.context.canvas.height
		);
		this.context.clearRect(
			this.img,
			0,
			0,
			this.context.canvas.width,
			this.context.canvas.height
		);
		this.loadImg();
	};

	render() {
        const style = {
            rubberBand:{
                position: "absolute",
                cursor: "crosshair",
                border:"3px solid aliceblue",
                display: this.state.rubberbandRectangle.display,
                top: this.state.rubberbandRectangle.top + "px",
                left: this.state.rubberbandRectangle.left + "px",
                width: this.state.rubberbandRectangle.width + "px",
                height: this.state.rubberbandRectangle.height + "px"
            },
            canvas:{
                border: "thin solid #aaaaaa",
                cursor: "crosshair",
                padding: "0",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "10%",
                display: "block"
            }
        }
		return (
			<div>
				<div id='controls'>
					<Button attached='bottom' onClick={this.reset}>
						Reset
					</Button>
				</div>
				<div
					id='rubberbandDiv'
					style={style.rubberBand}></div>
				<canvas
					id='cvs'
					width='800'
					height='520'
					onMouseDown={this.onCanvasClick}
					style={style.canvas}>
					Canvas not supported
				</canvas>
			</div>
		);
	}
}

export default Rubber;
