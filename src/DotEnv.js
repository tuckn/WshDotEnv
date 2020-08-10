/* globals Wsh: false */
/* globals __dirname: false */
/* globals process: false */

(function () {
  if (Wsh && Wsh.DotEnv) return;

  /**
   * DotEnv-like module for WSH (Windows Script Host) that reads/writes environment values in a .env file.
   *
   * @namespace DotEnv
   * @memberof Wsh
   * @requires {@link https://github.com/tuckn/WshModeJs|tuckn/WshModeJs}
   */
  Wsh.DotEnv = {};

  // Shorthands
  var CD = Wsh.Constants;
  var util = Wsh.Util;
  var path = Wsh.Path;
  var os = Wsh.OS;
  var fs = Wsh.FileSystem;

  var merge = util.merge;
  var obtain = util.obtainPropVal;
  var isPlainObject = util.isPlainObject;
  var hasOwnProp = util.hasOwnProp;
  var parseDate = util.parseDateLiteral;

  var dotenv = Wsh.DotEnv;

  /** @constant {string} */
  var MODULE_TITLE = 'WshDotEnv/DotEnv.js';

  var throwErrNonExist = function (functionName, typeErrVal) {
    fs.throwTypeErrorNonExisting(MODULE_TITLE, functionName, typeErrVal);
  };

  // dotenv.envPathDefault {{{
  /**
   * The path of .env directory in the current direcotory.
   *
   * @name envPathDefault
   * @memberof Wsh.DotEnv
   * @constant {string}
   */
  dotenv.envPathDefault = path.resolve(process.cwd(), '.env'); // }}}

  // dotenv.envPathPortable {{{
  /**
   * The path of .env directory in the directory of WSH script which is specified 1st argument by wscript.exe or cscript.exe.
   *
   * @name envPathPortable
   * @memberof Wsh.DotEnv
   * @constant {string}
   */
  dotenv.envPathPortable = path.resolve(__dirname, '.env'); // }}}

  // dotenv.envPathUsers {{{
  /**
   * The path of .env directory in the user's directory (%USERPROFILE%). Ex. C:\Users\<Name>\.env
   *
   * @name envPathUsers
   * @memberof Wsh.DotEnv
   * @constant {string}
   */
  dotenv.envPathUsers = path.resolve(os.homedir(), '.env'); // }}}

  dotenv.path = dotenv.envPathDefault;

  // dotenv.config {{{
  /**
   * Stores the values in .env file to {@link https://docs.tuckn.net/WshProcess/process.html#env|process.env}
   *
   * @example
   * // If the contents of .env file are following...
   * // # Lines beginning with # are threated as comments,
   * // EMPTY=
   * // JSON={ foo: "bar" }
   * // WHITE_SPACE=  some value 
   * // SINGLE_QUOTE='  some value '
   * // DOUBLE_QUOTE="  Some Value "
   * // MULTILINE="new
   * // line"
   * // DIR_7ZIP=C:\Program Files\7-Zip
   * // PATH_CONFIG=.\.config\office-smb-resources.json
   *
   * @example
   * var dotenv = Wsh.DotEnv;
   * dotenv.config();
   *
   * // Ex.1
   * console.dir(process.env);
   * // Outputs: {
   * //   ..
   * //   ...
   * //   EMPTY: '',
   * //   JSON: { foo: "bar" },
   * //   WHITE_SPACE: 'some value',
   * //   SINGLE_QUOTE: '  some value ',
   * //   DOUBLE_QUOTE: '  Some Value ',
   * //   MULTILINE: 'new\nline',
   * //   DIR_7ZIP: 'C:\\Program Files\\7-Zip',
   * //   PATH_CONFIG: '.\\.config\\office-smb-resources.json' }
   *
   * @example
   * // Ex.2 Failed to read .env file
   * var dotenv = Wsh.DotEnv;
   * var result = dotenv.config();
   *
   * if (result.error) throw result.error
   *
   * console.dir(result.parsed);
   * // Outputs: {
   * //   EMPTY: '',
   * //   JSON: { foo: "bar" },
   * //   WHITE_SPACE: 'some value',
   * //   SINGLE_QUOTE: '  some value ',
   * //   DOUBLE_QUOTE: '  Some Value ',
   * //   MULTILINE: 'new\nline',
   * //   DIR_7ZIP: 'C:\\Program Files\\7-Zip',
   * //   PATH_CONFIG: '.\\.config\\office-smb-resources.json' }
   * @function config
   * @memberof Wsh.DotEnv
   * @param {object} [options] - Optional parameters.
   * @param {string} [options.path] - Default: {@link Wsh.DotEnv.envPathDefault}. portable, userProfile, `File Path`
   * @param {boolean} [options.parsesDate=false] - Parses the path as the date literal. See {@link https://docs.tuckn.net/WshUtil/Wsh.Util.html#.parseDateLiteral}.
   * @param {string} [options.encoding] - Default: 'utf-8'. See {@link https://docs.tuckn.net/WshFileSystem/Wsh.FileSystem.html#.readFileSync|Wsh.FileSystem.readFileSync}
   * @returns {object} - Returns an Object with a `parsed` key containing the loaded content or an `error` key if it failed.
   */
  dotenv.config = function (options) {
    var functionName = 'dotenv.config';
    if (!isPlainObject(options)) options = {};

    var envPath = obtain(options, 'path', dotenv.envPathDefault);
    var parsesDate = obtain(options, 'parsesDate', false);

    if (/^portable$/i.test(envPath)) {
      dotenv.path = dotenv.envPathPortable;
    } else if (/^userProfile$/i.test(envPath)) {
      dotenv.path = dotenv.envPathUsers;
    } else {
      if (parsesDate) dotenv.path = parseDate(envPath);
      else dotenv.path = envPath;
    }

    try {
      if (!fs.existsSync(dotenv.path)) {
        throwErrNonExist(functionName, dotenv.path);
      }

      var encoding = obtain(options, 'encoding', CD.ado.charset.utf8);
      var envList = fs.readFileSync(dotenv.path, { encoding: encoding });
      var RE_NEWLINES = /\n|\r|\r\n/;
      var rows = envList.split(RE_NEWLINES);
      var parsed = {};

      rows.forEach(function (row) {
        var posNumberSign = row.indexOf('#');
        if (posNumberSign === 0) return; // Comment out

        var posEq = row.indexOf('=');
        if (posEq === -1) return; // @TODO Parse Error?

        var key = row.slice(0, posEq);
        if (hasOwnProp(process.env, key)) return;

        var val = row.slice(posEq + 1).trim();

        if (/^'[\s\S]*'$/.test(val)) { // Ex. '  some value '
          val = val.match(/^'([\s\S]*)'$/)[1].replace(/\\n/g, '\n');
        } else if (/^"[\s\S]*"$/.test(val)) { //  Ex. "  Some Value "
          val = val.match(/^"([\s\S]*)"$/)[1].replace(/\\n/g, '\n');
        }

        parsed[key] = val;
      });

      merge(process.env, parsed);
      return parsed;
    } catch (e) {
      return { error: e };
    }
  }; // }}}
})();

// vim:set foldmethod=marker commentstring=//%s :
