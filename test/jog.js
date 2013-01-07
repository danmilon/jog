
var Jog = require('../');

describe('Jog', function(){
  it('should expose .RedisStore', function(){
    Jog.should.have.property('RedisStore');
  })

  it('should expose .FileStore', function(){
    Jog.should.have.property('FileStore');
  })

  describe('when invoked as a regular function', function(){
    it('should return a Jog', function(){
      Jog().should.be.an.instanceof(Jog);
    })
  })

  describe('#write(level, type, attrs)', function(){
    it('should .add() to the store', function(done){
      var store = {
        add: function(obj){
          obj.level.should.equal('info');
          obj.timestamp.should.be.a('number');
          obj.type.should.equal('something happened');
          done();
        }
      };

      var log = new Jog(store);
      log.info('something happened');
    })

    it('should handle error instances', function (done){
      var err = new Error('BOOM')

      var store = {
        add: function(obj){
          obj.error.stack.should.equal(err.stack);
          obj.error.message.should.equal(err.message);
        }
      };

      var log = new Jog(store);
      log.error('something happened', { error: err });
      log.error('even worse', err);
      done();
    })

    it('should respect the log level', function (done) {
      var times = 0;
      var store = {
        add: function (obj) {
          times++;
          obj.message.should.be.ok;
          if (times === 2) {
            done();
          }
        }
      }

      var log = new Jog(store, {}, { level: 'info' });
      log.debug('this', { message: false });
      log.warn('this', { message: true });

      log.level = 'debug';

      log.debug('this', { message: true });

      log.level = 'error';

      log.warn('this', { message: false });
    })

    describe('#ns(obj)', function(){
      it('should return a Jog', function(done){
        var store = {
          add: function(obj){
            obj.vid.should.equal('abc');
            obj.uid.should.equal('tobi');
            obj.level.should.equal('info');
            obj.timestamp.should.be.a('number');
            obj.type.should.equal('something happened');
            done();
          }
        };

        var log = new Jog(store);
        var orig = log;
        log = log.ns({ vid: 'abc' }).ns({ uid: 'tobi' });
        log.should.not.equal(orig);
        log.info('something happened');
      })
    })
  })
})
