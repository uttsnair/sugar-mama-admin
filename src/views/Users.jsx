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
        
    ];

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

                setUsers(users);
            })
            .catch((err) => alert(err.message));
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div className="content">
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
