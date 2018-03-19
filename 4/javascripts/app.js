$(function() {
  var dcLogic = {
    __name: 'DCLogic',
    __services: [],
    __accessToken: null,
    __clientId: null,
    
    // セットアップ処理全体
    setup: function(options) {
      var dfd = this.deferred();
      var results = {};
      this.check(options)
      .then(this.own(function() {
        // 認可を得る
        return this.grant(options);
      }))
      .then(this.own(function(response) {
        results = {
          accessToken: response.accessToken,
          clientId: response.clientId
        };
        // 使えるサービスの一覧を得る
        return this.discover(results);
      }))
      .then(function(services) {
        results.services = services;
        return dfd.resolve(results);
      })
      // エラーの時はここ
      .fail(function(err) {
        dfd.reject(err);
      })
      return dfd.promise();
    },
    
    // DeviceConnectの生死チェック
    check: function(options) {
      var dfd = this.deferred();
      dConnect.setHost(options.host.split(":")[0]);
      dConnect.setPort(options.host.split(":")[1]);
      dConnect.checkDeviceConnect(
        // 接続確認完了
        function(apiVersion) {
          dfd.resolve({apiVersion: apiVersion});
        },
        // 接続失敗
        function(errorCode, errorMessage) {
          // エラーを送信します
          dfd.reject({
            errorCode: errorCode,
            errorMessage: errorMessage
          });
        }
      );
      return dfd.promise();
    },
    
    // 認可を得る処理
    grant: function(options) {
      var dfd = this.deferred();
      dConnect.authorization(
        options.scopes,
        options.applicationName,
        // 認可取得成功
        function(clientId, accessToken) {
          dfd.resolve({
            clientId: clientId,
            accessToken: accessToken
          });
        },
        // 認可取得失敗
        function(errorCode, errorMessage) {
          dfd.reject({
            errorCode: errorCode,
            errorMessage: errorMessage
          });
        }
      );
      return dfd.promise();
    },
    
    // デバイスをリストアップする処理
    discover: function(options) {
      var dfd = this.deferred();
      dConnect.discoverDevices(
        options.accessToken,
        // 一覧取得成功
        function(json) {
          dfd.resolve(json.services);
        },
        // 一覧取得失敗
        function(errorCode, errorMessage) {
          dfd.reject({
            errorCode: errorCode,
            errorMessage: errorMessage
          });
        }
      );
      return dfd.promise();
    },
    
    // サービスを見つける処理
    findService: function(name) {
      for (var i in this.__services) {
        if (this.__services[i].id.toLowerCase().indexOf(name.toLowerCase()) == 0) {
          return this.__services[i].id;
        }
      }
    },
    
    // バイブレーション
    vibrate: function() {
      var dfd = this.deferred();
      return dfd.promise();
    },
    
    // ライトのオン、オフ
    light: function(status) {
      var dfd = this.deferred();
      return dfd.promise();
    },
    
    // 通知処理
    notify: function(body) {
      var dfd = this.deferred();
      return dfd.promise();
    }
  };
  
  var appController = {
    __name: 'AppController',
    dcLogic: dcLogic,
    // デフォルトの設定
    __applicationName: "WoT",
    __host: url('?host') || 'localhost:4035',
    __scopes: [
      "serviceinformation",
      "servicediscovery",
      "notification",
      "vibration",
      "light"
    ],
    
    // コントローラ化が完了したら実行
    __ready: function() {
      this.setup(this.dcLogic.setup({
        applicationName: this.__applicationName,
        host: this.__host,
        scopes: this.__scopes
      }));
    },
    
    // セットアップ処理
    setup: function(response) {
      if (h5.async.isPromise(response)) {
        response.done(this.own(function(response) {
          this.setup(response);  
        }));
      } else {
        this.dcLogic.__accessToken = response.accessToken;
        this.dcLogic.__clientId = response.clientId;
        this.dcLogic.__services = response.services;
      }
    },
    
    // バイブレーション実行
    '#vibrate click': function(e) {
    },
    
    // ライトをオンにする処理
    '#lightOn click': function(e) {
    },
    
    // ライトをオフにする処理
    '#lightOff click': function(e) {
    },
    
    // 通知ボタンを押した時の処理
    '#notify click': function(e) {
    }
  };
  
  h5.core.controller('.container', appController);
});
