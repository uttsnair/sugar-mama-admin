import React, {useState} from "react";
import {
    Grid,
    Row,
    Col,
    Modal,
} from "react-bootstrap";
import Button from "components/CustomButton/CustomButton.jsx";

import {firestore} from "../firebase";
import {useEffect} from "react";


import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {textFilter} from "react-bootstrap-table2-filter";
import { Edit } from "@material-ui/icons";
import { Icon, IconButton } from "@material-ui/core";

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

export default function Users() {
    const [users, setUsers] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [quesAnsObj, setQuesAnsObj] = useState(null);

    const columns = [
        {
            dataField: "name",
            text: "Name",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "age",
            text: "Age",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "date",
            text: "Date",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "ethnicity",
            text: "Ethnicity",
            filter: textFilter(),
            sort: true,
        },
        {
            text: "Questions and Answers",
            formatter: (cellContent, row) => {
                return (
                    <td style={{justifyContent: "space-evenly"}}>
                        <IconButton>
                            <Edit
                                onClick={() => {
                                    viewQuesAns(row);
                                }}
                            />
                        </IconButton>
                    </td>
                );
            },
        },
    ];

    const viewQuesAns = (data) => {
        console.log(data);
        if (data && (data.GDMKQAnswers || data.DESAnswers)) {
            setQuesAnsObj(data);
        }
        else
            setQuesAnsObj("No Questions and Answers exist");
        setShowViewModal(true);
    }

    const getUsers = () => {
        firestore
            .collection("users")
            .get()
            .then((snapshot) => {
                const users = [];
                snapshot.forEach((doc) => {
                    let res = { id: doc.id, ...doc.data() };
                    res.date = res.date && res.date.seconds ? res.date.toDate().toString().split(' ').slice(0,4).join(' ') : '';
                    users.push(res);
                });
                console.log(users);
                setUsers(users);
            })
            .catch((err) => alert(err.message));
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div className="content">
            {showViewModal && (
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>Questions And Answers</Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{ maxHeight: '300px', overflowY: "scroll" }}>
                        <h5 style={{ fontWeight: 'bold' }}>GDMK Answers</h5>
                        <ul>
                            {(quesAnsObj.GDMKQAnswers || []).map((obj) => {
                                return (<div><li key="1"><div>{obj.ques}</div><div>User Answer: {(typeof obj === "string") ? obj : obj.ans}</div></li><br></br></div>)
                            })}
                        </ul>
                        <h5 style={{ fontWeight: 'bold' }}>DES Answers</h5>
                        <ul>
                            {(quesAnsObj.DESAnswers || []).map((obj) => {
                                return (<div><li key="1"><div>{obj.ques ? obj.ques : '' }</div><div>User Answer: {(typeof obj.ans === "object") ? obj.ans.label : obj.label}</div></li><br></br></div>)
                            })}
                        </ul>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            onClick={() => {
                                setShowViewModal(false);
                            }}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            )}
            <Grid fluid>
                <Row>
                    <Col md="12">
                        <BootstrapTable
                            rowStyle={{backgroundColor: "white"}}
                            keyField="id"
                            pagination={paginationFactory({
                                sizePerPage: 10,
                            })}
                            filter={filterFactory()}
                            keyField="id"
                            data={users}
                            columns={columns}
                        />
                    </Col>
                </Row>
            </Grid>
        </div>
    );
}
