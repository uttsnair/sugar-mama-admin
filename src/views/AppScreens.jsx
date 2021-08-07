import React, { useState } from "react";
import { Grid, Row, Col, DropdownButton, MenuItem } from "react-bootstrap";
import { Card } from "components/Card/Card.jsx";

import frontBg from "../assets/img/welcomeBg.jpg";

export default function AppScreens() {
	const [screen, setScreen] = useState({ name: "Front", key: 0 });
	const screens = ["Front", "Welcome"];

	const renderScreenList = () => {
		const array = [];
		screens.forEach((screen, index) => {
			array.push(<MenuItem eventKey={index}>{screen} Screen</MenuItem>);
		});
		return array;
	};

	const renderFrontScreen = () => {
		return (
			<div
				style={{
					backgroundImage: `url(${frontBg})`,
					height: "609px",
					width: "281.25px",
				}}
			></div>
		);
	};

	return (
		<div className="content">
			<Grid fluid>
				<Row>
					<Col md={8}>
						<Card
							id="chartHours"
							title=""
							content={<div className="ct-chart"></div>}
						/>
					</Col>
					<Col md={4}>
						<div>
							<DropdownButton bsStyle="default" title={screen.name + " Screen"}>
								{renderScreenList()}
							</DropdownButton>
							{renderFrontScreen()}
						</div>
					</Col>
				</Row>
			</Grid>
		</div>
	);
}
