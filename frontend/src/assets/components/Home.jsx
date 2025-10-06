import React, { useState, useEffect } from 'react';
import api from '../../api';

export const Home = () => {
    const [firstname, setFirstname] = useState('');
    useEffect(() => {
        const dataUser = async () => {
            try {
                const response = await api.get('/api/ktagile/users/info', {
                    withCredentials: true
                });
                setFirstname(response.data.firstname);
            } catch (err) {
                console.error('No se pudo obtener el usuario:', err);
            }
        };

        dataUser();
    }, []);

    return (
        <div className='p-5'>
            <div className="box p-5">
                <div className="field">
                    <h1 className="title" style={{ textAlign: 'center' }}>Bienvenido {firstname ? `${firstname}, `: ''} a la plataforma KT Agile</h1>
                </div>
                
            </div>
            <div className="field" style={{ textAlign: 'center' }}>
                <img src={`${import.meta.env.BASE_URL}/SALUDO.png`} alt="Imagen de bienvenida" style={{ maxWidth: '550px', height: 'auto' }} />
            </div>
        </div>

    )
}