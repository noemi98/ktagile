import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import axios from "axios";

import Swal from 'sweetalert2';

export const Task = ({ activeCheckboxes, handleTaskChange, tasks, setTasks }) => {
    const { spaceId } = useParams();

    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTask, setCurrentTask] = useState({
        id: null,
        title: '',
        description: '',
        timelimit: '',
        priority: 'Media'
    });

    const fetchTasks = async () => {
        try {
            const [allTaskRes, assignedTasksRes] = await Promise.all([
                api.get(`/api/ktagile/tasks/getdata/${spaceId}`),
                api.get(`/api/ktagile/tasks/getdatastatus/${spaceId}`),
            ]);

            const allTasks = allTaskRes.data;
            const assignedTaskIds = new Set(assignedTasksRes.data.map(task => task.id));

            const mergedTask = allTasks.map(task => ({
                ...task,
                isChecked: assignedTaskIds.has(task.id)
            }));

            setTasks(mergedTask);
        } catch(error){
            console.error("Error obteniendo las tareas: ", error);
        }
    }

    //Abrir/cerrar el modal
    const handleTaskModalToggle = () => {
        setTaskModalOpen(!isTaskModalOpen);
        if (!isTaskModalOpen) {
            //Abrir el modal
            const formattedTask = {
                ...currentTask,
                timelimit: currentTask.timelimit?.slice(0, 10)
            };
            setCurrentTask(formattedTask);
        }else{
            setCurrentTask({
                id: null,
                title: '',
                description: '',
                timelimit: '',
                priority: 'Baja',
                spaceId: spaceId
            });
            setIsEditMode(false);
        }
    };

    const handleNewTask = () => {
        console.log('Nueva tarea');
        setIsEditMode(false);
        //setTaskModalOpen(false);
        handleTaskModalToggle();
    }

    const handleInputChange = (e) => {
        //Extraer las propiedades name y value
        const { name, value } = e.target;
        setCurrentTask({ ...currentTask, [name]: value });
    };

    //Creación/Edición
    const handleSaveCreate = () => {
        if (isEditMode) {
            const formattedTask = {
                ...currentTask,
                timelimit: currentTask.timelimit?.slice(0, 10)
            };
            api.put(`/api/ktagile/tasks/updatedata/${currentTask.id}`, formattedTask)
                .then((response) => {
                    const updatedTask = response.data;
                    setTasks(prevTasks =>
                        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
                    );
                    fetchTasks();
                    Swal.fire({
                        title: 'Éxito',
                        text: 'La tarea ha sido actualizada.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo actualizar la tarea.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    });
                })
                handleTaskModalToggle();
        } else {
            api.post(`/api/ktagile/tasks/insertdata/${spaceId}`, currentTask)
                .then((response) => {
                    const newTask = response.data;
                    // Verificar si el nuevo task tiene un ID
                    if (!newTask.id) {
                        console.error('La nueva tarea no tiene ID:', newTask);
                    } else {
                        setTasks(prevTasks => [...prevTasks, newTask]); 
                    }

                    fetchTasks();
                    Swal.fire({
                        title: 'Éxito',
                        text: 'La tarea se ha creado correctamente.',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });
                });
                handleTaskModalToggle();
        }
    };

    const handleEditTask = (task) => {
        const formattedTask = {
            ...task,
            timelimit: task.timelimit?.slice(0, 10)
        };
        setCurrentTask(formattedTask);
        setIsEditMode(true);
        setTaskModalOpen(true);
    };

    const handleDisabledTask = (taskId) => {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if(result.isConfirmed) {
                api.put(`/api/ktagile/tasks/disabledata/${taskId}`)
                    .then((response) => {
                        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
                    });
            }
        })
    };
    
    return (
        <div className="column is-one-quarter" id="panel-task">
            <div className="box">
                <h2 className="title is-4">Listado de Tareas</h2>
                <button className="button is-primary is-rounded is-small" onClick={() => handleNewTask()} id="plus" title='Crear tarea'>
                    <span className='has-text-primary-20-invert'>+</span>
                </button>
            </div>
            <div className="box task-container">
                {tasks.map((task) => {
                    return(
                    <div key={task.id} className='task-box' style={{position: 'relative', width: '100%'}}>
                        <label className="checkbox" style={{width: '88%'}}>
                            <input
                                type="checkbox"
                                checked={task.isChecked || false}
                                disabled={!activeCheckboxes || task.isAssigned}
                                onChange={() => handleTaskChange(task)}
                                style={{width: '15px', height: '15px', marginRight: '5px'}}
                            />
                            <span className={`subtitle is-6 ${task.isChecked ? 'has-text-grey-light' : ''}`}
                                style={{ textDecoration: task.isChecked ? 'line-through' : 'none' }}>
                                &nbsp;{task.title}
                            </span>
                            
                        </label>
                        <button title='Editar tarea' onClick={() => handleEditTask(task)} style={{with: '10px', position:'absolute' , right: '35px'}}><i className='fa fa-pencil' style={{color: '#003F6F'}}></i></button>
                        <button title='Eliminar tarea' onClick={() => handleDisabledTask(task.id)} style={{with: '10px', position:'absolute' , right: '15px'}}><i className='fa fa-trash' style={{color: '#E95C5D'}}></i></button>
                    </div>
                    )
                })}
            </div>
            {isTaskModalOpen && (
                <div className="modal is-active">
                    <div className="modal-background" onClick={handleTaskModalToggle}></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">{isEditMode ? 'Editar tarea' : 'Nueva tarea'}</p>
                            <button className="delete" aria-label="close" onClick={handleTaskModalToggle}></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">Título</label>
                                <div className="control">
                                    <input className="input is-text" type="text" name="title"
                                        value={currentTask.title}
                                        onChange={handleInputChange}
                                        placeholder="Título de la tarea" />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Descripción</label>
                                <div className="control">
                                    <textarea className="textarea is-text" name="description"
                                        value={currentTask.description}
                                        onChange={handleInputChange}
                                        placeholder="Descripción de la tarea" rows={4}></textarea>
                                </div>
                            </div>
                            <div className='columns'>
                                <div className='column is-half'>
                                    <div className="field">
                                        <label className="label">Vencimiento</label>
                                        <div className="control">
                                            <input className="input is-text" type="date" name="timelimit"
                                                value={currentTask.timelimit}
                                                onChange={handleInputChange}
                                                placeholder="Fecha de vencimiento" />
                                        </div>
                                    </div>
                                </div>
                                <div className='column is-half'>
                                    <div className="field">
                                        <label className="label">Importancia</label>
                                        <div className="control">
                                            <div className="select is-fullwidth is-text">
                                                <select name="priority"
                                                    value={currentTask.priority}
                                                    onChange={handleInputChange}>
                                                    <option value={'Urgente'}>Urgente</option>
                                                    <option value={'Alta'}>Alta</option>
                                                    <option value={'Media'}>Media</option>
                                                    <option value={'Baja'}>Baja</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-success" onClick={handleSaveCreate}>{isEditMode ? 'Guardar cambios' : 'Crear tarea'}</button>&nbsp;
                            <button className="button" onClick={handleTaskModalToggle}>Cancelar</button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
