const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const Url = require('../backend/models/url');
const should = chai.should();

chai.use(chaiHttp);

describe('URL Shortener API', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/urlshortener_test', { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        done();
      });
  });

  after((done) => {
    mongoose.connection.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });

  describe('POST /shorten', () => {
    it('should shorten a valid URL', (done) => {
      const url = { longUrl: 'https://www.example.com' };
      chai.request(server)
        .post('/shorten')
        .send(url)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('shortUrl');
          done();
        });
    });

    it('should return an error for an invalid URL', (done) => {
      const url = { longUrl: 'invalid-url' };
      chai.request(server)
        .post('/shorten')
        .send(url)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').eql('Invalid URL');
          done();
        });
    });
  });

  describe('GET /:shortUrl', () => {
    it('should redirect to the original URL', (done) => {
      const url = new Url({ shortUrl: 'abc123', longUrl: 'https://www.example.com' });
      url.save((err) => {
        chai.request(server)
          .get('/abc123')
          .end((err, res) => {
            res.should.redirectTo('https://www.example.com');
            done();
          });
      });
    });

    it('should return 404 for an unknown short URL', (done) => {
      chai.request(server)
        .get('/unknown')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('URL not found');
          done();
        });
    });
  });
});
