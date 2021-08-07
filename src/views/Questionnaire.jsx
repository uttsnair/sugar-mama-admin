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
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";
import {IconButton} from "@material-ui/core";
import {Delete, Edit} from "@material-ui/icons";

export default function Questionnaire() {
	const [questionnaireType, setQuestionnaireType] = useState("DES");
	const [question, setQuestion] = useState("");
	const [option1, setOption1] = useState("");
	const [option2, setOption2] = useState("");
	const [option3, setOption3] = useState("");
	const [option4, setOption4] = useState("");
	const [questionsList, setQuestionsList] = useState({ DES: [], GDMKQ: [] });
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [questionId, setQuestionId] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [previousQuestion, setPreviousQuestion] = useState(null);
	const input = useRef();
	const columns = {
		Demographic: [
			{
				dataField: "question",
				text: "Question",
				filter: textFilter(),
				sort: true,
			},
			{
				dataField: "option1",
				text: "Option 1",
			},
			{
				dataField: "option2",
				text: "Option 2",
			},
			{
				dataField: "option3",
				text: "Option 3",
			},
			{
				dataField: "option4",
				text: "Option 4",
			},
			{
				text: "Actions",
				formatter: (cellContent, row) => {
					return (
						<td style={{ justifyContent: "space-evenly" }}>
							<IconButton>
								<Delete
									onClick={() => {
										removeQuestion(row.id);
									}}
								/>
							</IconButton>
							<IconButton>
								<Edit
									onClick={() => {
										editQuestion(row.id);
									}}
								/>
							</IconButton>
						</td>
					);
				},
			},
		],
		DES: [
			{
				dataField: "question",
				text: "Question",
				filter: textFilter(),
				sort: true,
			},
			{
				text: "Actions",
				formatter: (cellContent, row) => {
					return (
						<td style={{ justifyContent: "space-evenly" }}>
							<IconButton>
								<Delete
									onClick={() => {
										removeQuestion(row.id);
									}}
								/>
							</IconButton>
							<IconButton>
								<Edit
									onClick={() => {
										editQuestion(row.id);
									}}
								/>
							</IconButton>
						</td>
					);
				},
			},
		],
		GDMKQ: [
			{
				dataField: "question",
				text: "Question",
				filter: textFilter(),
				sort: true,
			},
			{
				dataField: "option1",
				text: "Option 1",
			},
			{
				dataField: "option2",
				text: "Option 2",
			},
			{
				dataField: "option3",
				text: "Option 3",
			},
			{
				dataField: "option4",
				text: "Option 4",
			},
			{
				text: "Actions",
				formatter: (cellContent, row) => {
					return (
						<td style={{ justifyContent: "space-evenly" }}>
							<IconButton>
								<Delete
									onClick={() => {
										removeQuestion(row.id);
									}}
								/>
							</IconButton>
							<IconButton>
								<Edit
									onClick={() => {
										editQuestion(row.id);
									}}
								/>
							</IconButton>
						</td>
					);
				},
			},
		],
	};

	useEffect(() => {
		getQuestions();
	}, []);

	const resetState = () => {
		setQuestion("");
		setOption1("");
		setOption2("");
		setOption3("");
		setOption4("");
		setIsEditing(false);
	};

	const getQuestions = () => {
		Promise.all([
			firestore.collection("DES").get(),
			firestore.collection("GDMKQ").get(),
			firestore.collection("Demographic").get(),
		]).then(
			([
				DESCollectionSnapshot,
				GDMKQCollectionSnapshot,
				DemographicCollectionSnapshot,
			]) => {
				const DES = [];
				const GDMKQ = [];
				const Demographic = [];
				DESCollectionSnapshot.forEach((doc) =>
					DES.push({ id: doc.id, ...doc.data() })
				);
				GDMKQCollectionSnapshot.forEach((doc) =>
					GDMKQ.push({ id: doc.id, ...doc.data() })
				);
				DemographicCollectionSnapshot.forEach((doc) =>
					Demographic.push({ id: doc.id, ...doc.data() })
				);
				setQuestionsList({ DES, GDMKQ, Demographic });
			}
		);
	};

	const addQuestion = () => {
		const list = questionsList[questionnaireType];
		const entry = {};
		if (questionnaireType === "DES") {
			entry.question = question;
		}
		if (questionnaireType === "GDMKQ" || questionnaireType === "Demographic") {
			entry.question = question;
			entry.option1 = option1;
			entry.option2 = option2;
			entry.option3 = option3;
			entry.option4 = option4;
		}
		firestore
			.collection(questionnaireType)
			.add(entry)
			.then((snapshot) => {
				entry.id = snapshot.id;
				list.push(entry);
				setQuestionsList({ ...questionsList, [questionnaireType]: [...list] });
				resetState();
			})
			.catch((err) => alert(err.message));
	};

	const removeQuestion = (id) => {
		firestore
			.collection(questionnaireType)
			.doc(id)
			.delete()
			.then(() => {
				const oldQuestionList = questionsList[questionnaireType];
				const newQuestionList = oldQuestionList.filter(
					(entry) => entry.id !== id
				);
				setQuestionsList({
					...questionsList,
					[questionnaireType]: [...newQuestionList],
				});
			});
	};

	const editQuestion = (id) => {
		setQuestionId(id);
		const question = questionsList[questionnaireType].find(
			(question) => question.id === id
		);
		console.log(question);
		switch (questionnaireType) {
			case "DES":
				setQuestion(question.question);
				break;
			case "Demographic":
			case "GDMKQ":
				setQuestion(question.question);
				setOption1(question.option1);
				setOption2(question.option2);
				setOption3(question.option3);
				setOption4(question.option4);
				break;
			default:
				break;
		}
		setIsEditing(true);
	};

	const saveChanges = () => {
		const entry = {};
		if (questionnaireType === "DES" || questionnaireType === "Demographic") {
			entry.question = question;
		}
		if (questionnaireType === "GDMKQ") {
			entry.question = question;
			entry.option1 = option1;
			entry.option2 = option2;
			entry.option3 = option3;
			entry.option4 = option4;
		}
		firestore
			.collection(questionnaireType)
			.doc(questionId)
			.update({
				...entry,
			})
			.then(() => {
				const oldQuestionList = questionsList[questionnaireType];
				const newQuestionList = oldQuestionList.filter(
					(entry) => entry.id !== questionId
				);
				const entry = {};
				if (
					questionnaireType === "DES"
				) {
					entry.question = question;
				}
				if (questionnaireType === "GDMKQ" ||
					questionnaireType === "Demographic") {
					entry.question = question;
					entry.option1 = option1;
					entry.option2 = option2;
					entry.option3 = option3;
					entry.option4 = option4;
				}
				newQuestionList.push({ id: questionId, ...entry });
				setQuestionsList({
					...questionsList,
					[questionnaireType]: [...newQuestionList],
				});
			});
	};

	const renderQuestionnaireInputs = () => {
		if (questionnaireType === "DES") {
			return (
				<FormInputs
					ncols={["col-md-12"]}
					properties={[
						{
							label: "Question",
							bsClass: "form-control",
							placeholder: "In general, I believe that...",
							defaultValue: "In general, I believe that...",
							value: question,
							onChange: (e) => {
								setQuestion(e.target.value);
							},
						},
					]}
				></FormInputs>
			);
		}
		if (questionnaireType === "GDMKQ" || questionnaireType === "Demographic") {
			return (
				<FormInputs
					ncols={["col-md-12", "col-md-6", "col-md-6", "col-md-6", "col-md-6"]}
					properties={[
						{
							label: "Question",
							bsClass: "form-control",
							placeholder: "Question",
							value: question,
							onChange: (e) => {
								setQuestion(e.target.value);
							},
						},
						{
							label: "Option 1",
							bsClass: "form-control",
							placeholder: "Option 1",
							value: option1,
							onChange: (e) => {
								setOption1(e.target.value);
							},
						},
						{
							label: "Option 2",
							bsClass: "form-control",
							placeholder: "Option 2",
							value: option2,
							onChange: (e) => {
								setOption2(e.target.value);
							},
						},
						{
							label: "Option 3",
							bsClass: "form-control",
							placeholder: "Option 3",
							value: option3,
							onChange: (e) => {
								setOption3(e.target.value);
							},
						},
						{
							label: "Option 4",
							bsClass: "form-control",
							placeholder: "Option 4",
							value: option4,
							onChange: (e) => {
								setOption4(e.target.value);
							},
						},
					]}
				></FormInputs>
			);
		}
	};

	return (
		<div className="content">
			<Grid fluid>
				<Row>
					<Col md={12}>
						<Card
							scroll
							id="chartHours"
							title="Questionnaires"
							content={
								<div className="ct-chart">
									<DropdownButton
										style={{ marginBottom: "20px" }}
										bsStyle="default"
										title={questionnaireType}
									>
										<MenuItem
											onSelect={() => {
												setQuestionnaireType("Demographic");
											}}
											value="Demographic"
										>
											Demographic
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setQuestionnaireType("DES");
											}}
											value="DES"
										>
											DES
										</MenuItem>
										<MenuItem
											onSelect={() => {
												setQuestionnaireType("GDMKQ");
											}}
											value="GDMKQ"
										>
											GDMKQ
										</MenuItem>
									</DropdownButton>
									{renderQuestionnaireInputs()}

									<Button
										style={{ marginBottom: "20px", marginLeft: "20px" }}
										bsStyle="info"
										fill
										type="button"
										onClick={!isEditing ? addQuestion : saveChanges}
										disabled={question === ""}
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
						<BootstrapTable
							rowStyle={{ backgroundColor: "white" }}
							keyField="id"
							pagination={paginationFactory({
								sizePerPage: 10,
							})}
							filter={filterFactory()}
							keyField="id"
							data={questionsList[questionnaireType]}
							columns={columns[questionnaireType]}
						/>
					</Col>
				</Row>
			</Grid>
		</div>
	);
}
