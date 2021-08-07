import React, { useState, useRef } from "react";
import {
	Grid,
	Row,
	Col,
	DropdownButton,
	MenuItem,
	Table,
	Modal,
} from "react-bootstrap";
import { Card } from "components/Card/Card.jsx";

import frontBg from "../assets/img/welcomeBg.jpg";
import FormInputs from "components/FormInputs/FormInputs";
import Button from "components/CustomButton/CustomButton.jsx";

import placeholder from "../assets/img/placeholder.png";

import { firestore, storage } from "../firebase";
import { useEffect } from "react";

export default function QuickTips() {
	const [screen, setScreen] = useState("Home");
	const [tip, setTip] = useState("");
	const [tips, setTips] = useState([]);
	const [tipId, setTipId] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [consentLink, setConsentLink] = useState("");
	const [tipType, setTipType] = useState("OK");

	useEffect(() => {
		getTips();
	}, []);

	const resetState = () => {
		setTip("");
		setIsEditing(false);
		setTipType("OK");
	};

	const getTips = () => {
		firestore
			.collection("tips")
			.get()
			.then((snapshot) => {
				const temp = [];
				snapshot.forEach((doc) => temp.push({ id: doc.id, ...doc.data() }));
				setTips([...temp]);
			});
	};

	const addTip = () => {
		const entry = {};
		entry.tip = tip;
		entry.screen = screen;
		entry.type = tipType;
		firestore
			.collection("tips")
			.add(entry)
			.then((snapshot) => {
				entry.id = snapshot.id;
				setTips([...tips, entry]);
				resetState();
			})
			.catch((err) => alert(err.message));
	};

	const removeTip = (id) => {
		firestore
			.collection("tips")
			.doc(id)
			.delete()
			.then(() => {
				setTips(tips.filter((entry) => entry.id !== id));
			});
	};

	const editTip = (id) => {
		setTipId(id);
		const tip = tips.find((tip) => tip.id === id);
		setTip(tip.tip);
		setScreen(tip.screen);
		setTipType(tip.type);
		setIsEditing(true);
	};

	const saveChanges = () => {
		const entry = {};
		entry.tip = tip;
		entry.screen = screen;
		entry.type = tipType;

		firestore
			.collection("tips")
			.doc(tipId)
			.update({
				...entry,
			})
			.then(() => {
				setTips([...tips.filter((tip) => tip.id !== tipId), entry]);
				resetState();
			});
	};

	const renderInput = () => {
		return (
			<>
				<FormInputs
					ncols={["col-md-12"]}
					properties={[
						{
							label: "Quick Tip",
							bsClass: "form-control",
							placeholder: "Add a quick tip",
							defaultValue: "",
							value: tip,
							onChange: (e) => {
								setTip(e.target.value);
							},
						},
					]}
				></FormInputs>
				<p className="text-muted">Type</p>
				<DropdownButton
					style={{ marginBottom: "20px" }}
					bsStyle="default"
					title={tipType}
				>
					<MenuItem
						onSelect={() => {
							setTipType("OK");
						}}
						value="OK"
					>
						OK
					</MenuItem>
					<MenuItem
						onSelect={() => {
							setTipType("Yes/No");
						}}
						value="Yes/No"
					>
						Yes/No
					</MenuItem>
				</DropdownButton>
			</>
		);
	};

	const renderTips = () => {
		let render;
		render = tips.sort().map((entry) => {
			return (
				<tr>
					<td>{entry.tip}</td>
					<td>{entry.screen}</td>
					<td style={{ justifyContent: "space-evenly" }}>
						<i
							onClick={() => {
								removeTip(entry.id);
							}}
							className="pe-7s-trash mr-2"
						/>
						<i
							onClick={() => {
								editTip(entry.id);
							}}
							className="pe-7s-edit mr-2"
						/>
					</td>
				</tr>
			);
		});

		return (
			<Table bordered condensed hover>
				<thead>
					<tr>
						<th>Tip</th>
						<th>Screen</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>{render}</tbody>
			</Table>
		);
	};

	useEffect(() => {
		getConsentLink();
	}, []);

	function validURL(str) {
		var pattern = new RegExp(
			"^(https?:\\/\\/)?" + // protocol
				"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
				"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
				"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
				"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
				"(\\#[-a-z\\d_]*)?$",
			"i"
		); // fragment locator
		return !!pattern.test(str);
	}

	const getConsentLink = () => {
		firestore
			.collection("static")
			.doc("consent")
			.get()
			.then((snapshot) => {
				setConsentLink(snapshot.data().link || "");
			});
	};

	const updateConsentLink = () => {
		if (validURL(consentLink)) {
			firestore
				.collection("static")
				.doc("consent")
				.set({ link: consentLink })
				.then(() => {
					alert("Link updated successfully");
				});
		} else {
			alert("Invalid Link");
		}
	};

	return (
		<div className="content">
			<Grid fluid>
				<Row>
					<Col md={12}>
						<FormInputs
							ncols={["col-md-12"]}
							properties={[
								{
									label: "Consent link",
									bsClass: "form-control",
									placeholder: "Consent link",
									value: consentLink,
									onChange: (e) => {
										setConsentLink(e.target.value);
									},
								},
							]}
						></FormInputs>
						<Button
							style={{ marginBottom: "20px", marginLeft: "20px" }}
							bsStyle="info"
							fill
							type="button"
							onClick={updateConsentLink}
							pullRight
						>
							Save
							<i className={"pe-7s-edit"} />
						</Button>
					</Col>
				</Row>
				<Row>
					<Col md={12}>
						<Card
							scroll
							id="chartHours"
							title="Add new quick tip"
							content={
								<div className="ct-chart">
									<p className="text-muted">Screen</p>
									<DropdownButton
										style={{ marginBottom: "20px" }}
										bsStyle="default"
										title={screen}
									>
										<MenuItem
											onSelect={() => {
												setScreen("Home");
											}}
											value="Home"
										>
											Home
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Categories");
											}}
											value="Categories"
										>
											Categories
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Modules");
											}}
											value="Modules"
										>
											Modules
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Saved");
											}}
											value="Saved"
										>
											Saved
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Notes");
											}}
											value="Notes"
										>
											Notes
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Goals");
											}}
											value="Goals"
										>
											Goals
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setScreen("Appointments");
											}}
											value="Appointments"
										>
											Appointments
										</MenuItem>
									</DropdownButton>
									{renderInput()}

									<Button
										style={{ marginBottom: "20px", marginLeft: "20px" }}
										bsStyle="info"
										fill
										type="button"
										onClick={!isEditing ? addTip : saveChanges}
										disabled={tip === ""}
										pullRight
									>
										{!isEditing ? "Add" : "Save"}{" "}
										<i className={!isEditing ? "pe-7s-plus" : "pe-7s-edit"} />
									</Button>
								</div>
							}
						></Card>
					</Col>
				</Row>
				<Row>
					<Col md="12">
						<Card
							scroll
							id="chartHours"
							title="Quick Tips"
							content={
								<div className="ct-chart">
									<Row>{renderTips()}</Row>
								</div>
							}
						></Card>
					</Col>
				</Row>
			</Grid>
		</div>
	);
}
