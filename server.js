const express = require('express');
const crypto = require('crypto');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movieSchema');
const { error } = require('console');

const app = express();

// metodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE


// CORS PRE-Flight
// OPTIONS
const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:5500',
    'http://localhost:3000',
    'https://movies.com',
    'https://wolffcode.io',
]

app.use(express.json())
app.disable('x-powered-by');

const PORT = process.env.PORT ?? 1234

app.options('/movies/:id', (req,res) => {
    const origin = req.header('origin');
    console.log(origin)
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    }
    res.send(200)
});

app.listen(PORT, () => {
    console.log('server arriba en el puerto 1234')
});

app.get('/', (req, res) => {
    res.status(200).send('<h1> Hello There !</h1>')
});

app.get('/movies', (req,res) => {
    const origin = req.header('origin');
    // cuando la peticion proviene del mismo origen el navegador no envia el header origin
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }
    const { genre } = req.query;
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }

    // if(filteredMovies > 0){
    //     res.json(filteredMovies)
    // }else{
    // res.status(404).json({'message': 'movie not found'})
    // }
    res.json(movies)
});

app.get('/movies/:id', (req, res) => { // Aqui :id significa que es un segmento dinamico, estos seran los parametros de la url
    //pathtoregex

    // ruta/:mas/:otro/:etc
    // const {id, mas, otro, etc} = req.params;
    const {id} = req.params;
    const movie = movies.find(movie => movie.id == id)
    // dcdd0fad-a94c-4810-8acc-5f108d3b18c3
    if(movie){
        res.json(movie)
    }else {
        res.status(404).json({message: 'movie not found'})
    }
});

app.post('/movies' ,(req,res) =>{
    
    const  result = validateMovie(req.body);

    if(result.error){
        res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(), //esto genera un uuid v4
        ...result.data
    }
    // if(!title, !year, !director, !duration, !poster, !genre, !rate){
    //     return res.status(400).json('maestro te faltan datos asi como ?')
    // }
    // esto no sería REST, porque esta guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie)
    res.status(201).send(newMovie) //algo consideradco como buena practica es regresar el nuevo objeto creado asi podiamos actualizar la cahce del cliente por ejemplo
});

app.delete('/movies/:id', (req,res) => {
    const origin = req.header('origin');
    if(ACCEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }
    const {id} = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'});
    }

    movies.splice(movieIndex, 1);

    return res.json({message: 'Movie deleted succesfully'})
});

app.patch('/movies/:id', (req,res) => {
    const result = validatePartialMovie(req.body)
    
    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)});
    }

    const {id} = req.params;
    const movieindex = movies.findIndex(movie => movie.id === id);
    if(movieindex=== -1){
        return res.status(404).json({message: 'sorry, movie not found!'});
    }

    const updatedMovie = {
        ...movies[movieindex],
        ...result.data
    }

    movies[movieindex] = updatedMovie

    return res.json(updatedMovie)
});