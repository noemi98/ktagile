import React, { useState, useEffect } from 'react';

export const Home = () => {
    return (
        <div className='p-5'>
            <div className="box p-5">
                <div className="field">
                    <h1 className="title" style={{ textAlign: 'center' }}>Bienvenido a la plataforma KT Agile</h1>
                </div>
                
            </div>
            <div className="field" style={{ textAlign: 'center' }}>
                <img src="/SALUDO.png" alt="KT Agile Logo" style={{ maxWidth: '550px', height: 'auto' }} />
            </div>
        </div>

    )
}