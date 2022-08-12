var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}'
].join('\n');

var fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(1.0,0.0,0.0, 1.0);',
'}'
].join('\n');


var InitDemo = function (){
    //loadTextResource('/Hand 1.j');
    loadJSONResource('/Hand 2.json', function(modelErr, modelObj){
        if (modelErr){
            alert('error getting hand model');
            console.log(modelErr);
        }else{
            RunDemo(modelObj);
        }
    });
}

var RunDemo = function (HandModel) {
    console.log("this is working");

    const canvas = document.createElement('canvas');
    document.querySelector('body').appendChild(canvas);
    canvas.width = 800;
    canvas.height = 600;

    var gl = canvas.getContext('webgl');

    gl.clearColor(0.7,0.85,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);// makes sure you only see the sides closest to the camera
    
    // makes sure that even though we only see the frontface, the pc does not waste resources drawing the backface
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("error linking programs", gl.getProgramInfoLog(program));
        return;
    }


    var modelVertices = HandModel.meshes[0].vertices;

    var modelIndices = [].concat.apply([], HandModel.meshes[0].faces);

    var VertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

    var IndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

    var postionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(postionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

    //var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    //gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(postionAttribLocation);
    //gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');

    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0,0,-15], [0,0,0], [0,1,0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);



    //Main render loop
    var angle = 0;
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);

    var loop = function(){

        //angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //glMatrix.mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
        //gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


        gl.clearColor(0.7,0.85,0.8,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);
        
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
};