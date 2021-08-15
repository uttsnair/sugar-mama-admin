import React, {useState, useRef} from "react";
import {
    Grid,
    Row,
    Col,
    DropdownButton,
    MenuItem,
    Table,
    Modal,
} from "react-bootstrap";
import {Card} from "components/Card/Card.jsx";
import frontBg from "../assets/img/welcomeBg.jpg";
import FormInputs from "components/FormInputs/FormInputs";
import Button from "components/CustomButton/CustomButton.jsx";

import placeholder from "../assets/img/placeholder.png";
import {Delete, Edit} from '@material-ui/icons';
import {Icon, IconButton} from "@material-ui/core"
import {firestore, storage} from "../firebase";
import {useEffect} from "react";

import {WithContext as ReactTags} from "react-tag-input";

import {Editor} from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
    ContentState,
    convertFromHTML,
    convertFromRaw,
    convertToRaw,
    EditorState,
} from "draft-js";
import {stateToHTML} from "draft-js-export-html";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, {textFilter} from "react-bootstrap-table2-filter";

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

export default function Modules() {
    const [moduleType, setModuleType] = useState("Text");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Self-Care");
    const [description, setDescription] = useState("");
    const [editorState, setEditorState] = useState(null);
    const [image, setImage] = useState(null);
    const [goal, setGoal] = useState("");
    const [links, setLinks] = useState(["http://"]);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [modules, setModules] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [moduleId, setModuleId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previousModule, setPreviousModule] = useState(null);
    const input = useRef();
    const [tags, setTags] = useState([]);
    const columns = [
        {
            dataField: "title",
            text: "Title",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "category",
            text: "Category",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "type",
            text: "Type",
            filter: textFilter(),
            sort: true,
        },
        {
            dataField: "goal",
            text: "Goal",
            sort: true,
        },
        {
            text: "Actions",
            formatter: (cellContent, row) => {
                return (
                    <td style={{justifyContent: "space-evenly"}}>
                        <IconButton>
                            <Delete
                                onClick={() => {
                                    setModuleId(row.id);
                                    setShowDeleteModal(true);
                                }}
                            />
                        </IconButton>
                        <IconButton>
                            <Edit
                                onClick={() => {
                                    editModule(row);
                                }}
                            />
                        </IconButton>
                    </td>
                );
            },
        },
    ];

    const handleDelete = (i) => {
        setTags(tags.filter((tag, index) => index !== i));
    };

    const handleAddition = (tag) => {
        setTags([...tags, tag]);
    };

    const resetState = () => {
        setModuleType("Text");
        setTitle("");
        setCategory("Self-Care");
        setDescription("");
        setEditorState(null);
        setImage(null);
        setGoal("");
        setLinks(["https://"]);
        setProgress(0);
        setShowProgress(false);
        setIsEditing(false);
        setTags([]);
    };

    const addLink = () => {
        setLinks([...links, "http://"]);
    };

    const removeLink = () => {
        if (links.length > 1) {
            const newLinks = links;
            newLinks.pop();
            setLinks([...newLinks]);
        }
    };

    const addModule = () => {
        setShowProgress(true);
        const uploadTask = storage.ref().child(`modules/${title}`).put(image);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (err) => {
                alert("Error uploading file");
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    const module = {
                        type: moduleType,
                        category: category,
                        title: title,
                        description: description,
                        image: downloadURL,
                        goal: goal,
                        createdAt: Date(),
                        tags: tags,
                    };
                    if (moduleType === "Video") {
                        module.links = links;
                    }
                    firestore
                        .collection("modules")
                        .add(module)
                        .then((snapshot) => {
                            module.id = snapshot.id;
                            alert("Module added successfully");
                            resetState();
                            setModules([...modules, module]);
                        })
                        .catch((err) => {
                            alert(err.message);
                        });
                });
            }
        );
    };

    const getModules = () => {
        firestore
            .collection("modules")
            .get()
            .then((snapshot) => {
                const modules = [];
                snapshot.forEach((doc) => {
                    modules.push({id: doc.id, ...doc.data()});
                });
                modules.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                })
                setModules(modules);
            })
            .catch((err) => alert(err.message));
    };

    const deleteModule = (id) => {
        firestore
            .collection("modules")
            .doc(id)
            .delete()
            .then(() => {
                const newModules = modules.filter((module) => module.id !== id);
                setModules([...newModules]);
                setShowDeleteModal(false);
            })
            .catch((err) => alert(err.message));
    };

    const editModule = (module) => {
        setPreviousModule(module);
        setModuleId(module.id);
        setModuleType(module.type);
        setTitle(module.title);
        setCategory(module.category);
        setDescription(module.description);
        const blocksFromHTML = convertFromHTML(module.description);
        const state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap
        );
        setEditorState(EditorState.createWithContent(state));
        setImage(module.image);
        setGoal(module.goal);
        setTags(module.tags || []);
        if (module.type === "Video") setLinks(module.links);
        setIsEditing(true);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const saveChanges = () => {
        const module = {};
        module.type = moduleType;
        module.title = title;
        module.category = category;
        module.description = description;
        module.goal = goal;
        if (previousModule.image !== image) {
            setShowProgress(true);
            const uploadTask = storage.ref().child(`modules/${title}`).put(image);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                },
                (err) => {
                    alert("Error uploading file");
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        const module = {
                            type: moduleType,
                            category: category,
                            title: title,
                            description: description,
                            image: downloadURL,
                            goal: goal,
                            createdAt: Date(),
                            tags: tags,
                        };
                        if (moduleType === "Video") {
                            module.links = links;
                        }
                        firestore
                            .collection("modules")
                            .doc(moduleId)
                            .update(module)
                            .then(() => {
                                alert("Module edited successfully");
                                resetState();
                                const newModules = modules.filter(
                                    (module) => module.id !== moduleId
                                );
                                setModules([...newModules, module]);
                                setIsEditing(false);
                            })
                            .catch((err) => {
                                alert(err.message);
                            });
                    });
                }
            );
        } else {
            const module = {
                type: moduleType,
                category: category,
                title: title,
                description: description,
                image: image,
                goal: goal,
                createdAt: Date(),
                tags: tags,
            };
            if (moduleType === "Video") {
                module.links = links;
            }
            firestore
                .collection("modules")
                .doc(moduleId)
                .update(module)
                .then(() => {
                    alert("Module edited successfully");
                    resetState();
                    const newModules = modules.filter((module) => module.id !== moduleId);
                    setModules([...newModules, module]);
                    setIsEditing(false);
                })
                .catch((err) => {
                    alert(err.message);
                });
        }
    };

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

    useEffect(() => {
        getModules();
    }, []);

    return (
        <div className="content">
            {showDeleteModal && (
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Title>Are you sure</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>You are about to delete a module</Modal.Body>

                    <Modal.Footer>
                        <Button
                            onClick={() => {
                                setShowDeleteModal(false);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            bsStyle="danger"
                            onClick={() => {
                                deleteModule(moduleId);
                            }}
                        >
                            Yes, delete
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            )}
            <Grid fluid>
                <Row>
                    <Col md={8}>
                        <Card
                            scroll
                            id="chartHours"
                            title="Add new module"
                            ctTableResponsive
                            content={
                                <div className="ct-chart">
                                    {isEditing && (
                                        <Button
                                            style={{marginBottom: "20px", marginLeft: "20px"}}
                                            bsStyle="info"
                                            fill
                                            type="button"
                                            onClick={resetState}
                                            disabled={image === null}
                                            pullRight
                                        >
                                            Cancel
                                            <i className="pe-7s-close"/>
                                        </Button>
                                    )}
                                    <Button
                                        style={{marginBottom: "20px", marginLeft: "20px"}}
                                        bsStyle="info"
                                        fill
                                        type="button"
                                        onClick={!isEditing ? addModule : saveChanges}
                                        disabled={image === null}
                                        pullRight
                                    >
                                        {!isEditing ? "Add" : "Save"}{" "}
                                        <i className={!isEditing ? "pe-7s-plus" : "pe-7s-edit"}/>
                                    </Button>

                                    <FormInputs
                                        ncols={["col-md-12"]}
                                        properties={[
                                            {
                                                label: "Goal",
                                                bsClass: "form-control",
                                                placeholder: "Goal",
                                                value: goal,
                                                onChange: (e) => {
                                                    setGoal(e.target.value);
                                                },
                                            },
                                        ]}
                                    />

                                    <Editor
                                        editorState={editorState}
                                        toolbarClassName="toolbarClassName"
                                        wrapperClassName="wrapperClassName"
                                        editorClassName="editorClassName"
                                        editorStyle={{
                                            border: "1px solid silver",
                                            minHeight: "300px",
                                        }}
                                        onEditorStateChange={(editorState) => {
                                            setDescription(
                                                stateToHTML(editorState.getCurrentContent())
                                            );
                                            setEditorState(editorState);
                                        }}
                                    />
                                    {moduleType === "Video" && (
                                        <>
                                            <Button
                                                style={{marginBottom: "20px"}}
                                                bsStyle="info"
                                                fill
                                                type="button"
                                                onClick={addLink}
                                            >
                                                Add Link
                                            </Button>
                                            <Button
                                                style={{marginBottom: "20px", marginLeft: "20px"}}
                                                bsStyle="info"
                                                fill
                                                type="button"
                                                onClick={removeLink}
                                                disabled={links.length < 2}
                                            >
                                                Remove Link
                                            </Button>
                                            <FormInputs
                                                ncols={links.map(() => "col-md-12")}
                                                properties={links.map((item, index) => ({
                                                    label: `Link ${index + 1}`,
                                                    type: "text",
                                                    bsClass: "form-control",
                                                    placeholder: `Link ${index + 1}`,
                                                    onChange: (e) => {
                                                        const value = e.target.value;
                                                        const newLinks = links;
                                                        newLinks[index] = value;
                                                        setLinks([...newLinks]);
                                                    },
                                                    value: links[index],
                                                }))}
                                            />
                                        </>
                                    )}
                                </div>
                            }
                        />
                    </Col>
                    <Col md={4}>
                        <Card
                            scroll
                            id="chartHours"
                            title="Module details"
                            content={
                                <div className="ct-chart">
                                    <p className="text-muted">Type</p>
                                    <DropdownButton
                                        style={{marginBottom: "20px"}}
                                        bsStyle="default"
                                        title={moduleType}
                                    >
                                        <MenuItem
                                            onSelect={() => {
                                                setModuleType("Text");
                                            }}
                                            value="Text"
                                        >
                                            Text
                                        </MenuItem>
                                        <MenuItem
                                            onSelect={() => {
                                                setModuleType("Video");
                                            }}
                                            value="Video"
                                        >
                                            Video
                                        </MenuItem>
                                    </DropdownButton>

                                    <p className="text-muted">Category</p>
                                    <DropdownButton
                                        style={{marginBottom: "20px"}}
                                        bsStyle="default"
                                        title={category}
                                    >
                                        <MenuItem
                                            onSelect={() => {
                                                setCategory("Self-Care");
                                            }}
                                            value="Self-Care"
                                        >
                                            Self-care
                                        </MenuItem>
                                        <MenuItem
                                            onSelect={() => {
                                                setCategory("Medical");
                                            }}
                                            value="Medical"
                                        >
                                            Medical
                                        </MenuItem>
                                        <MenuItem
                                            onSelect={() => {
                                                setCategory("Stess & Anxiety");
                                            }}
                                            value="Stress & Anxiety"
                                        >
                                            Stress & Anxiety
                                        </MenuItem>
                                        <MenuItem
                                            onSelect={() => {
                                                setCategory("Support");
                                            }}
                                            value="Support"
                                        >
                                            Support
                                        </MenuItem>
                                    </DropdownButton>

                                    <FormInputs
                                        ncols={["col-md-12"]}
                                        properties={[
                                            {
                                                label: "Title",
                                                type: "text",
                                                bsClass: "form-control",
                                                placeholder: "Title",
                                                value: title,
                                                onChange: (e) => {
                                                    setTitle(e.target.value);
                                                },
                                            },
                                        ]}
                                    />
                                    <p className="text-muted">Image</p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {console.log(image)}
                                        <img
                                            onClick={() => {
                                                input.current.click();
                                            }}
                                            style={{height: "100px", border: "1px solid steelblue"}}
                                            src={!image ? placeholder : image}
                                        />
                                        {showProgress && (
                                            <p className="text-muted mt-5">Uploading {progress}%</p>
                                        )}
                                        <input
                                            onChange={(e) => {
                                                setImage(e.target.files[0]);
                                            }}
                                            ref={input}
                                            type="file"
                                            style={{visibility: "hidden"}}
                                            accept="image/png,image/jpeg"
                                        />
                                    </div>
                                    <div style={{paddingBottom: 20}}>
                                        <p className="text-muted">Keywords</p>
                                        <ReactTags
                                            tags={tags}
                                            handleDelete={handleDelete}
                                            handleAddition={handleAddition}
                                            delimiters={delimiters}
                                        />
                                    </div>
                                </div>
                            }
                        />
                    </Col>
                </Row>
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
                            data={modules}
                            columns={columns}
                        />
                    </Col>
                </Row>
            </Grid>
        </div>
    );
}
