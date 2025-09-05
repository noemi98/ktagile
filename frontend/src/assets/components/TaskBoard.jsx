import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from './Task';
import api from '../../api';
import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';

import Swal from 'sweetalert2';

export const TaskBoard = () => {
   //FILTRO DE TAREAS POR SPACE
   const { spaceId } = useParams();
   const [tasks, setTasks] = useState([]);
   const [nameSpace, setNameSpace] = useState("");

   const fetchTasks = async () => {
      try {
         const response = await api.get(`/api/ktagile/tasks/getdata/${spaceId}`);
         const formatedData = response.data.map(task => ({
            ...task,
            timelimit: new Date(task.timelimit).toISOString().split('T')[0],
         }));
         setTasks(formatedData);
      } catch (error) {
         console.error("Error obteniendo las tareas:", error);
      }
   };

   useEffect(() => {
      fetchTasks(); // Cargar tareas
      fetchCategories(); // Cargar categorias
      fetchAssignedTasks(); //Traer tareas con categoria
      fetchNameSpace(); //Traer el nombre del espacio
   }, [spaceId]);

   const [isModalOpen, setModalOpen] = useState(false);
   const [isModalCatOpen, setModalCatOpen] = useState(false);
   const [isTableVisible, setIsTableVisible] = useState(false);

   const toggleModalOpen = () => {
      setModalOpen(!isModalOpen);
   }
   const toggleModalCatOpen = () => {
      setModalCatOpen(!isModalCatOpen);
   }

   // Para las categorías del tablero
   const [categoryCount, setCategoryCount] = useState(3);
   const [categoryNames, setCategoryNames] = useState(["Por hacer", "En proceso", "Hecho"]);

   //Traer el nombre del SPACE
   const fetchNameSpace = async () => {
      try {
         const response = await api.get(`/api/ktagile/spaces/getname/${spaceId}`);
         setNameSpace(response.data[0].title);
         console.log("Nombre del ESPACIO DE TRABAJO:", response.data[0].title);
      } catch (error) {
         console.log("Error al obtener el nombre del ESPACIO DE TRABAJO");
      }
   }

   //Traer las categorias del SPACE
   const fetchCategories = async () => {
      try {
         const response = await api.get(`/api/ktagile/categories/getdata/${spaceId}`);
         if(!response.data[0]){
            Swal.fire({
              title: 'Error',
              text: 'No hay categorías para este espacio',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });

            return; // Si no hay categorías, no muestra la tabla y cierra el modal de categorías
         }else{
            const {category1, category2, category3, category4, category5, category6} = response.data[0];
            const updateCategory = [
               category1, category2, category3, category4, category5, category6
            ].filter(category => category !== null);
            //Actualizar los valores de CategoryNames, sólo los que no son nulos
            setCategoryNames(updateCategory);
            setIsTableVisible(true);
            setCategoryCount(updateCategory.length);
         }
      } catch (error) {
         console.error("Error obteniendo las categorias:", error);
      }
   };

   const handleCategoryCountChange = (event) => {
      const count = parseInt(event.target.value, 10);

      setCategoryCount(count);

      if (count > categoryNames.length) {
         const newCategories = [...categoryNames];
         while (newCategories.length < count) {
            newCategories.push("");
         }
         setCategoryNames(newCategories);
      } else if (count < categoryNames.length) {
         setCategoryNames(categoryNames.slice(0, count));
      }
   };

   const handleCategoryNameChange = (index, event) => {
      const newCategories = [...categoryNames];
      newCategories[index] = event.target.value;
      setCategoryNames(newCategories);
   };

   // Para dibujar la tabla según las categorías
   const handleCreateBoard = () => {
      // No campos vacíos
      if (categoryNames.some((col) => col === '')) {
         alert('Todos los campos son obligatorios');
         return;
      }else{
         toggleModalCatOpen();
         setIsTableVisible(true);
         handleSaveCategories();
      }
   };

   const handleSaveCategories = async () => {
      const categoryData = {
         category1: categoryNames[0],
         category2: categoryNames[1],
         category3: categoryNames[2],
         category4: categoryNames[3],
         category5: categoryNames[4],
         category6: categoryNames[5],
      };
      
      api.post(`/api/ktagile/categories/insertdata/${spaceId}`, categoryData)
         .then((response) => {
            Swal.fire({
               title: 'Éxito',
               text: 'Las categorías fueron asignadas correctamente a tu espacio de trabajo.',
               icon: 'success',
               confirmButtonText: 'Aceptar'
            });
         });
   }

   // Para activar el check de las tareas
   const [activeCheckboxes, setActiveCheckboxes] = useState(false);
   const [assignedTasks, setAssignedTasks] = useState({});
   const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);

   //Botón + para añadir a una categoría
   const handlePlusClick = (index) => {
      setActiveCheckboxes(true);
      setSelectedCategoryIndex(index);
   };

   const isTaskDisabled = (task) => {
      // Verifica si la tarea está en cualquier categoría
      return Object.values(assignedTasks).flat().some(t => t.id === task.id);
   };

   //Traer las tareas que tienen una categoria asignada
   const fetchAssignedTasks = async () => {
      try {
         const response = await api.get(`/api/ktagile/tasks/getdatastatus/${spaceId}`);
         const tasks = response.data;

         // Agrupamos las tareas por el campo "status"
         const groupedTasks = tasks.reduce((acc, task) => {
            // Si no existe la categoría, inicializamos el array para esa categoría
            if (!acc[(task.status-1)]) {
               acc[(task.status-1)] = [];
            }

            //Bloqueo y tache
            setTasks(prevTasks =>
               prevTasks.map(t =>
                  t.id === task.id ? { ...t, isChecked: true } : t
               )
            );

            // Agregar la tarea al array
            acc[(task.status-1)].push(task);
            return acc;
         }, {});

         // Actualizar el estado con las tareas agrupadas
         setAssignedTasks(groupedTasks);

      } catch (error) {
         console.error("Error obteniendo las tareas asignadas:", error);
      }
   };

   //Tarea seleccionada para la categoría
   const handleTaskSelect = (task) => {
      const newAssignedTasks = { ...assignedTasks }; //Copia del estado (oper propa)
      if (!newAssignedTasks[selectedCategoryIndex]) {
         newAssignedTasks[selectedCategoryIndex] = [];
      }
      newAssignedTasks[selectedCategoryIndex].push(task);

      setAssignedTasks(newAssignedTasks);

      //Bloqueo y tache
      setTasks(prevTasks =>
         prevTasks.map(t =>
            t.id === task.id ? { ...t, isChecked: true } : t
         )
      );

      api.put(`/api/ktagile/tasks/updatecategory/${task.id}`, { assignedCategory: selectedCategoryIndex + 1 })
         .then((response) => {
            console.log("Tarea movida a la categoría:", response);
         });

      setActiveCheckboxes(false);
      setSelectedCategoryIndex(null);
   };

   const isTaskAssigned = (task) => {
      /*return Object.values(assignedTasks).some(
         tasksInCategory => tasksInCategory.includes(task)
      );*/
      return Object.values(assignedTasks).flat().includes(task);
   };

   // Remover tarea de la categoría
   const handleTaskRemove = (task, categoryIndex) => {
      const newAssignedTasks = { ...assignedTasks };
      newAssignedTasks[categoryIndex] = newAssignedTasks[categoryIndex].filter(t => t !== task);
      setAssignedTasks(newAssignedTasks);
      
      setTasks(prevTasks =>
         prevTasks.map(t =>
            t.id === task.id ? { ...t, isChecked: false } : t
         )
      );
      
      api.put(`/api/ktagile/tasks/quitcategory/${task.id}`)
         .then((response) => {
            console.log("Tarea movida de la categoría:", response);
         });
   };

   // Modificación en el checkbox para que esté vinculado al estado/categoría - se trae desde Task.jsx
   const handleTaskChange = (task) => {
      if (task.isChecked) {
         handleTaskRemove(task, selectedCategoryIndex);
      } else {
         handleTaskSelect(task);
      }
   };

   // Mover tarea a la siguiente categoría
   const handleTaskMoveToNext = (task, categoryIndex) => {
      event.preventDefault(); // Previene el menú contextual del navegador
      const newAssignedTasks = { ...assignedTasks };
      newAssignedTasks[categoryIndex] = newAssignedTasks[categoryIndex].filter(t => t !== task);
      const nextCategoryIndex = (categoryIndex + 1) % categoryCount;
      if (!newAssignedTasks[nextCategoryIndex]) {
         newAssignedTasks[nextCategoryIndex] = [];
      }
      newAssignedTasks[nextCategoryIndex].push(task);
      setAssignedTasks(newAssignedTasks);
      
      api.put(`/api/ktagile/tasks/updatecategory/${task.id}`, { assignedCategory: nextCategoryIndex + 1 })
         .then((response) => {
            console.log("Tarea movida a la categoría:", response.data['category_name']);
         });
   };

   return (
      <div className="columns p-4">
         <Task
            toggleModalOpen={() => { }}
            activeCheckboxes={activeCheckboxes}
            handleTaskChange={handleTaskChange}
            tasks={tasks}
            setTasks={setTasks}
         />
         <div className="column" id="panel-board">
            <div className="box header is-flex is-justify-content-space-between is-align-items-center">
               <div className="is-flex is-align-items-center">
                  <h2 className="title is-4 is-spaced bd-anchor-title"><strong>Tablero Kanban</strong></h2>&nbsp;-&nbsp;
                  <h2 className='subtitle is-4 is-spaced bd-anchor-title'>{nameSpace}</h2>
               </div>
               <button style={{with:'10px', position:'relative', left: '28px'}} data-tooltip="Uso: Haz clic en la tarea para quitarla del tablero. Haz clic derecho para moverla a la siguiente categoría."><i className="fa fa-question-circle"></i></button>
               <button className="button is-primary" onClick={toggleModalCatOpen}>Crear</button>
            </div>
            <div className='box tableroKanban'>
               <div className="table-container is-fullwidth">
                  {isTableVisible && (
                     <table className="table is-fullwidth table-kanban">
                     <thead>
                        <tr>
                           {categoryNames.map((name, index) => (
                              <th key={index} style={{
                                 textAlign: 'center',
                                 backgroundColor: '#EBECF0',
                                 height: '30px',
                                 verticalAlign: 'middle'
                              }}>
                                 {name || `Categoría ${index + 1}`}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           {categoryNames.map((_, index) => (
                              <td key={index} style={{ height: '80vh', textAlign: 'center' }}>
                                 <div className='pb-4'>
                                    <button className="button is-primary is-rounded is-small" id="plus" style={{ opacity: 0.7 }} onClick={() => handlePlusClick(index)} title="Agregar tarea">
                                       <span className='has-text-primary-20-invert'>+</span>
                                    </button>
                                 </div>
                                 {assignedTasks[index] && assignedTasks[index].map((task, taskIndex) => (
                                    <div
                                       key={taskIndex}
                                       className='task-box-2'
                                       onClick={() => handleTaskRemove(task, index)}
                                       onContextMenu={() => handleTaskMoveToNext(task, index)}
                                    >
                                       <span className='subtitle is-6'>{task.title}</span>
                                    </div>
                                 ))}
                              </td>
                           ))}
                        </tr>
                     </tbody>
                  </table>
                  )}
                  
               </div>
            </div>
         </div>
         {isModalCatOpen && (
            <div className="modal is-active">
               <div className="modal-background" onClick={toggleModalCatOpen}></div>
               <div className="modal-card">
                  <header className="modal-card-head">
                     <p className="modal-card-title">Tablero Kanban</p>
                     <button className="delete" aria-label="close" onClick={toggleModalCatOpen}></button>
                  </header>
                  <section className="modal-card-body">
                     <div className="field">
                        <label className="label">Cantidad de Categorías</label>
                        <div className="control ">
                           <input
                              className="input is-text"
                              type="number"
                              value={categoryCount}
                              onChange={handleCategoryCountChange}
                              min="3"
                              max="6"
                           />
                        </div>
                     </div>
                     <div className="columns is-multiline">
                        {categoryNames.map((name, index) => (
                           <div key={index} className="column is-half">
                              <div className="field">
                                 <label className="label">{`Nombre de Categoría ${index + 1}`}</label>
                                 <div className="control">
                                    <input
                                       className="input"
                                       type="text"
                                       value={name}
                                       onChange={(event) => handleCategoryNameChange(index, event)}
                                       placeholder={`Categoría ${index + 1}`}
                                       required
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
                  <footer className="modal-card-foot">
                     <button className="button is-success" onClick={handleCreateBoard}>Crear</button>&nbsp;
                     <button className="button" onClick={toggleModalCatOpen}>Cancelar</button>
                  </footer>
               </div>
            </div>
         )}
      </div>
   );
}
