/* globals Wsh: false */
/* globals process: false */

/* globals describe: false */
/* globals test: false */
/* globals expect: false */

// Shorthand
var util = Wsh.Util;
var os = Wsh.OS;
var fs = Wsh.FileSystem;
var fse = Wsh.FileSystemExtra;
var dotenv = Wsh.DotEnv;

var isError = util.isError;
var cloneDeep = util.cloneDeep;
var parseDate = util.parseDateLiteral;

var _cb = function (fn/* , args */) {
  var args = Array.from(arguments).slice(1);
  return function () { fn.apply(null, args); };
};

describe('DotEnv', function () {
  test('nonEnvFile', function () {
    var envPath = dotenv.envPathDefault;

    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);

    var result = dotenv.config();
    expect(isError(result.error)).toBe(true);
  });

  test('emptyEnvFile', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathDefault;
    fs.writeFileSync(envPath, '\r\n', { encoding: 'utf8' });

    var preEnv = cloneDeep(process.env);

    var result = dotenv.config();
    expect(isError(result.error)).toBe(false);

    expect(process.env).toEqual(preEnv);

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('loadEnvFile', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathDefault;
    var envSets = [
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    // Before config()
    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    var result = dotenv.config();
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('commentsInEnv', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathDefault;
    var envSets = [
      '# 7zip directory',
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      '# Connecting SMB resources',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    var result = dotenv.config();
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('valuesInEnv', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathDefault;
    var envSets = [
      '# Lines beginning with # are threated as comments',
      'EMPTY=', // EMPTY: ''
      'JSON={ foo: "bar" }', // JSON: '{ foo: "bar" }'
      'WHITE_SPACE=  some value ', // WHITE_SPACE: 'some value'
      'SINGLE_QUOTE=\'  some value \'', // SINGLE_QUOTE: '  some value '
      'DOUBLE_QUOTE="  Some Value "', // DOUBLE_QUOTE: '  Some Value '
      'MULTILINE="new\\nline"' // MULTILINE: 'new\nline'
    ];

    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.EMPTY).toBeUndefined();
    expect(process.env.JSON).toBeUndefined();
    expect(process.env.WHITE_SPACE).toBeUndefined();
    expect(process.env.SINGLE_QUOTE).toBeUndefined();
    expect(process.env.DOUBLE_QUOTE).toBeUndefined();
    expect(process.env.MULTILINE).toBeUndefined();

    var result = dotenv.config();
    expect(isError(result.error)).toBe(false);

    expect(process.env.EMPTY).toBe('');
    expect(process.env.JSON).toBe('{ foo: "bar" }');
    expect(process.env.WHITE_SPACE).toBe('some value');
    expect(process.env.SINGLE_QUOTE).toBe('  some value ');
    expect(process.env.DOUBLE_QUOTE).toBe('  Some Value ');
    expect(process.env.MULTILINE).toBe('new\nline');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('customPathEnv', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = os.makeTmpPath('DotEnv_');
    var envSets = [
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    var result = dotenv.config({ path: envPath });
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('customPathEnv_DateLeteral', function () {
    process.env = os.getEnvVars(); // Resets env values

    var dtLiteral = '#{yyyy-MM}';
    var dtStr = parseDate(dtLiteral);
    var envPathHead = os.makeTmpPath('DotEnv_');
    var envPath = envPathHead + '_' + dtStr;
    var envSets = [
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    // Non parsesDate (false)
    var result = dotenv.config({ path: envPathHead + '_' + dtLiteral });
    expect(isError(result.error)).toBe(true);

    // parsesDate is true
    result = dotenv.config({
      path: envPathHead + '_' + dtLiteral,
      parsesDate: true
    });
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('portableEnv', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathPortable;
    var envSets = [
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    var result = dotenv.config({ path: 'portable' });
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });

  test('userProfileEnv', function () {
    process.env = os.getEnvVars(); // Resets env values

    var envPath = dotenv.envPathUsers;
    var envSets = [
      'DIR_7ZIP=C:\\Program Files\\7-Zip',
      'PATH_IRFANVIEW=C:\\Program Files\\IrfanView\\i_view64.exe',
      'PATH_CONFIG=.\\.config\\office-smb-resources.json'
    ];
    fs.writeFileSync(envPath, envSets.join('\n'), { encoding: 'utf8' });

    expect(process.env.DIR_7ZIP).toBeUndefined();
    expect(process.env.PATH_IRFANVIEW).toBeUndefined();
    expect(process.env.PATH_CONFIG).toBeUndefined();

    var result = dotenv.config({ path: 'userProfile' });
    expect(isError(result.error)).toBe(false);

    expect(process.env.DIR_7ZIP).toBe('C:\\Program Files\\7-Zip');
    expect(process.env.PATH_IRFANVIEW).toBe('C:\\Program Files\\IrfanView\\i_view64.exe');
    expect(process.env.PATH_CONFIG).toBe('.\\.config\\office-smb-resources.json');

    // Cleans
    fse.removeSync(envPath);
    expect(fs.existsSync(envPath)).toBe(false);
  });
});
