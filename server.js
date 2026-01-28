const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const PORT = 9291;
const categoryRouter = require('./router/category/router');
// const googleapi = require('./router/google_api_router/router');
const productrouter = require('./router/Product/router');

require('dotenv').config({
	path: './application.env',
});

const corsOpts = {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	allowedHeaders: ['*'],
};

require('./connect');

const version = '/api/v1';
// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOpts));

/* Category */
app.use(`${version}/category`, categoryRouter);
/* Category */

// /* Google */
// app.use(`${version}/google`, googleapi);
// /* Google */

/* Product */
app.use(`${version}/product`, productrouter);
/* Product */

// /* ORDER */
// app.use(`${version}/order`, orderrouter);
// /* ORDER */

// /* Cart */
// app.use(`${version}/cart`, cartrouter);
// /* Cart */

// /* Auth */
// app.use(`${version}/login`, userrouter);
// /* Auth */

// /* Stock */
// app.use(`${version}/stock`, router);
// /* Stock */

// /*Testimonial*/
// app.use(`${version}/testimonial`, testimonialroute);
// /*Testimonial*/

// /*Rating*/
// app.use(`${version}/rating`, ratingroute);
// /*Rating*/

/* IMAGE ENPOINT */
app.use('/resources', express.static(path.join(__dirname, 'images')));
// app.use('/banner', express.static(path.join(__dirname, 'images/banner')));
/* IMAGE ENPOINT */
app.listen(PORT, () => {
	console.log(`Started at ${PORT}`);
});
