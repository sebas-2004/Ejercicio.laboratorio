const readline = require('readline-sync');

class Persona {
    constructor(nombre, edad, genero, regimen, ingreso, nivelSisben) {
        this._nombre = nombre;
        this._edad = edad;
        this._genero = genero;
        this._regimen = regimen;
        this._ingreso = ingreso;
        this._nivelSisben = nivelSisben || null;
    }

    calcularDescuento(costoPrueba) {
        let descuento = 0;
        if (this._nivelSisben) {
            const tasasDescuento = { 'A': 0.20, 'B1': 0.15, 'B2': 0.10 };
            descuento = costoPrueba * (tasasDescuento[this._nivelSisben] || 0);
        }
        if (this._regimen === 'contributivo' && this._ingreso > 3000) {
            descuento += costoPrueba * 0.05; 
        }
        return descuento;
    }
}

class PersonaJuridica extends Persona {
    constructor(nombre, regimen, ingreso, nivelSisben) {
        super(nombre, 0, '', regimen, ingreso, nivelSisben);
    }

    calcularDescuento(costoPrueba) {
        let descuento = super.calcularDescuento(costoPrueba); 
        if (this._regimen === 'contributivo' && this._ingreso > 3000) {
            descuento += costoPrueba * 0.05; 
        }
        return descuento;
    }
}

class Laboratorio {
    constructor(nombre) {
        this._nombre = nombre;
        this._pruebas = [];
    }

    agregarPrueba(prueba) {
        this._pruebas.push(prueba);
    }
}

class Prueba {
    constructor(nombre, tipo, costo) {
        this._nombre = nombre;
        this._tipo = tipo;
        this._costo = costo;
        this._personas = [];
    }

    agregarPersona(persona) {
        this._personas.push(persona);
    }

    calcularCostoFinal() {
        let totalCosto = 0;
        let descuentosPorSisben = {};
        for (let persona of this._personas) {
            let descuento = persona.calcularDescuento(this._costo);
            let nivelSisben = persona._nivelSisben || 'ninguno';
            descuentosPorSisben[nivelSisben] = (descuentosPorSisben[nivelSisben] || 0) + descuento;
            totalCosto += this._costo - descuento;
        }
        return { totalCosto, descuentosPorSisben };
    }
}

class Farmaceutica {
    constructor() {
        this._laboratorios = [];
    }

    agregarLaboratorio(laboratorio) {
        this._laboratorios.push(laboratorio);
    }

    calcularIngresosTotales() {
        let total = 0;
        let ingresosPorRegimen = { contributivo: 0, subsidiado: 0 };
        let ingresosPorTipo = {};
        let descuentosPorSisben = {};
        let ingresosContributivoSisbenB1 = 0; 
    
        for (let laboratorio of this._laboratorios) {
            for (let prueba of laboratorio._pruebas) {
                let resultado = prueba.calcularCostoFinal();
                total += resultado.totalCosto;
    
                prueba._personas.forEach(persona => {
                    let descuento = persona.calcularDescuento(prueba._costo);
                    ingresosPorRegimen[persona._regimen] += prueba._costo - descuento;
    
                    if (persona._regimen === 'contributivo' && persona._nivelSisben === 'B1') {
                        ingresosContributivoSisbenB1 += prueba._costo - descuento;
                    }
                });
    
                ingresosPorTipo[prueba._tipo] = (ingresosPorTipo[prueba._tipo] || 0) + resultado.totalCosto;
    
                for (const nivel in resultado.descuentosPorSisben) {
                    descuentosPorSisben[nivel] = (descuentosPorSisben[nivel] || 0) + resultado.descuentosPorSisben[nivel];
                }
            }
        }
    
        return {
            total,
            ingresosPorRegimen,
            ingresosPorTipo,
            descuentosPorSisben,
            promedioIngresoPorLaboratorio: total / this._laboratorios.length,
            ingresosContributivoSisbenB1 
        };
    }
}

class nodoPersona {
    constructor (persona){
        this.valor = persona;
        this.siguiente = null ;

    }

}
class listaPersona{
    constructor(){
        this.cabeza = null;
    }
    insertar(Persona){
        const nuevonodo = new nodoPersona(Persona);
        if(this.cabeza === null){
            this.cabeza = nuevonodo;
        } else {
            let nodotmp = this.cabeza;
            while (nodotmp.siguiente !== null){
                nodotmp = nodotmp.siguiente;
            }
            nodotmp.siguiente = nuevonodo;
            }

    }
}




function main() {
    let farmaceutica = new Farmaceutica();
    let seguir = true;

    while (seguir) {
        let nombreLaboratorio = readline.question('Nombre del laboratorio: ');
        let laboratorio = new Laboratorio(nombreLaboratorio);
        farmaceutica.agregarLaboratorio(laboratorio);

        let agregarOtraPrueba = true;
        while (agregarOtraPrueba) {
            let nombrePrueba = readline.question('Nombre de la prueba: ');
            let tipoPrueba = readline.question('Tipo de prueba: ');
            let costoPrueba = parseFloat(readline.question('Costo de la prueba: '));
            let prueba = new Prueba(nombrePrueba, tipoPrueba, costoPrueba);
            laboratorio.agregarPrueba(prueba);

            let agregarOtraPersona = true;
            while (agregarOtraPersona) {
                let nombrePersona = readline.question('Nombre de la persona: ');
                let tipoPersona = readline.question('Tipo de persona (natural/juridica): ').toLowerCase();
                let regimenPersona = readline.question('Régimen (subsidiado/contributivo): ');
                let ingresoPersona = parseFloat(readline.question('Ingreso mensual de la persona: '));
                let nivelSisben = readline.question('Nivel Sisben (A, B1, B2, ninguno): ');
                nivelSisben = nivelSisben !== 'ninguno' ? nivelSisben : null;

                if (tipoPersona === 'natural') {
                    let edadPersona = parseInt(readline.question('Edad de la persona: '));
                    let generoPersona = readline.question('Género de la persona (m/f): ');
                    let persona = new Persona(nombrePersona, edadPersona, generoPersona, regimenPersona, ingresoPersona, nivelSisben);
                    prueba.agregarPersona(persona);
                } else if (tipoPersona === 'juridica') {
                    let personaJuridica = new PersonaJuridica(nombrePersona, regimenPersona, ingresoPersona, nivelSisben);
                    prueba.agregarPersona(personaJuridica);
                }

                agregarOtraPersona = readline.question('¿Agregar otra persona a esta prueba? (s/n): ').toLowerCase() === 's';
            }

            agregarOtraPrueba = readline.question('¿Agregar otra prueba al laboratorio? (s/n): ').toLowerCase() === 's';
        }

        seguir = readline.question('¿Registrar otro laboratorio? (s/n): ').toLowerCase() === 's';
    }

    let resultados = farmaceutica.calcularIngresosTotales();
    console.log('Ingresos totales: $', resultados.total);
    console.log('Ingresos por régimen:', resultados.ingresosPorRegimen);
    console.log('Ingresos por tipo de examen:', resultados.ingresosPorTipo);
    console.log('Descuentos por SISBEN:', resultados.descuentosPorSisben);
    console.log('Promedio de ingreso por laboratorio: $', resultados.promedioIngresoPorLaboratorio);
    console.log('Ingresos contributivo SISBEN B1: $', resultados.ingresosContributivoSisbenB1);
}



main();