import app from './app';

const PORT = 1500;

const server = app.listen(1500, () => {
    console.log(`App is listening at port ${PORT}`);
    console.log('Press Ctrl+c to stop');
});

export default server;
