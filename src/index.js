import React from "react";
import ReactDOM from "react-dom";
import Listener from "./listener";
import Rubber from "./rubber";
import Clock from "./clock";
import Rect from "./rect";
import Shadow from "./shadow";
import Nonzero from "./paperCut";
import GridAxis from "./GridAxis";
import RubberLine from "./RubberLine";

const App = () => {
	return (
		<div>
			{/* <Rubber/> */}
			{/* <Clock/> */}
			{/* <Rect/> */}
			{/* <Shadow /> */}
			{/* <Nonzero /> */}
			{/* <GridAxis/> */}
			<RubberLine />
		</div>
	);
};

ReactDOM.render(<App />, document.querySelector("#root"));
