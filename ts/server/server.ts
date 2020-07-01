import app from './app';

const PORT = 1410;

const server = app.listen(1410, () => {
    console.log(`App is listening at port ${PORT}`);
    console.log('Press Ctrl+c to stop');
});

export default server;
