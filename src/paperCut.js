import React, { Component } from "react";
import $ from "jquery";

class NonzeroWinding extends Component {
	componentDidMount() {
		const cvs = $("#cvs")[0];
		const ctx = cvs.getContext("2d");
		ctx.save();
        this.drawArcs(cvs, ctx);
        this.drawRects(ctx);
	}

	drawArcs = (canvas, context) => {
		const radius_l = 150;
        const radius_s = 100;

        context.shadowColor = "rgba(0,0,0,0.8)";
		context.shadowOffsetX = 12;
		context.shadowOffsetY = 12;
        context.shadowBlur = 15;
        context.fillStyle = "lightgray";

		context.beginPath();
		context.arc(
			canvas.width / 2,
			canvas.height / 2,
			radius_l,
			0,
			Math.PI * 2,
			false
        );
        /* context.fill();
        context.stroke();
        
        context.beginPath(); */
		context.arc(
			canvas.width / 2,
			canvas.height / 2,
			radius_s,
			0,
			Math.PI * 2,
			true
		);
		context.fill();
        context.stroke();
        
		context.closePath();
		context.restore();
	};

	drawRects = (context) => {
        context.beginPath();
        this.drawNonzeroRect(0, 0 , 150, 150, true, context);
        this.drawNonzeroRect(20, 20, 50, 25, false, context);
        this.drawNonzeroRect(80, 80, 50, 45, false, context);
        context.strokeStyle = "black";
        context.shadowColor = "black";
        context.shadowOffsetX = 12;
        context.shadowOffsetY = 12;
        context.shadowBlur = 10;
        context.stroke();
        context.fillStyle = "lightgray";
        context.fill();
        context.closePath()
        context.restore();
    };

	drawNonzeroRect = (x, y, w, h, dir, context) => {
		context.moveTo(x, y);
		if (dir) {
			context.lineTo(x + w, y);
			context.lineTo(x + w, y + h);
			context.lineTo(x, y + h);
		} else {
			context.lineTo(x, y + h);
			context.lineTo(x + w, y + h);
            context.lineTo(x + w, y);
        }
        context.lineTo(x, y);
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
				<canvas id='cvs' style={style.canvas} width='800' height='800'>
					canvas not surported
				</canvas>
			</div>
		);
	}
}

export default NonzeroWinding;
