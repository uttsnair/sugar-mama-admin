import React, { useState, useContext } from "react";
import { FormGroup, Form, Row, Col } from "react-bootstrap";
import _ from "lodash";
import { auth } from "../firebase";
import { AuthContext } from "../providers/AuthProvider";
import { Card } from "components/Card/Card.jsx";
import FormInputs from "components/FormInputs/FormInputs";
import logo from "../assets/img/logo.png";
import Button from "components/CustomButton/CustomButton.jsx";
import { Redirect } from "react-router";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const authContext = useContext(AuthContext);

	const _login = (e) => {
		auth
			.signInWithEmailAndPassword(email, password)
			.then(() => {
				authContext._setUser(auth.currentUser);
			})
			.catch((err) => {
				alert(err.message);
			});
		e.preventDefault();
	};

	return (
		<>
			<div className="content" style={{overflow: 'hidden'}}>
				<Row>
					<Col md="4"></Col>
					<Col md="4" className="mt-2">
						<img
							src={logo}
							style={{ height: "100px" }}
							className="mx-auto block mt-2 mb-2"
						></img>
						<Card
							content={
								<div className="ct-chart">
									<FormInputs
										ncols={["col-md-12", "col-md-12"]}
										properties={[
											{
												label: "Email",
												type: "email",
												bsClass: "form-control",
												placeholder: "Email",
												value: email,
												onChange: (e) => {
													setEmail(e.target.value);
												},
											},
											{
												label: "Password",
												type: "password",
												bsClass: "form-control",
												placeholder: "Password",
												value: password,
												onChange: (e) => {
													setPassword(e.target.value);
												},
											},
										]}
									></FormInputs>

									<Row>
										<Col md="12">
											<div className="mx-auto mt-2">
												<Button
													className="mx-auto block"
													color="primary"
													type="submit"
													fill
													bsStyle="info"
													onClick={_login}
												>
													Login
												</Button>
											</div>
										</Col>
									</Row>
								</div>
							}
						></Card>
					</Col>
				</Row>
			</div>
		</>
	);
}
