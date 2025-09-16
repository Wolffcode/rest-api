
const z = require('zod');
const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        require_error: 'Movie title is required. Please, Check'
    }),
    year: z.number().int().positive().min(1900).max(2026),
    director: z.string(),
    duration: z.number().int().positive().min(40),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror','Thriller', 'Sci-Fi']),
        {
            required_error: 'Movie genre is required',
            invalid_type_error: 'Movie genre mus be an an array of enum Genre'
        }
    )
});

function validateMovie (object) {
    return movieSchema.safeParse(object);
}

function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object);
}

module.exports = {
    validateMovie,
    validatePartialMovie
}