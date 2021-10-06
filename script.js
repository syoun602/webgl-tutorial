var gl;
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;  // Now we can use function without glMatrix.~~~

function testGLError(functionLastCalled) {
    /* gl.getError returns the last error that occurred using WebGL for debugging */ 
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext('webgl');
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    var drag=false;

    var original_x, original_y;
    
    var mouseDown=function(e) {
        drag=true;
        original_x = e.pageX;
        original_y = e.pageY;
        e.preventDefault();

    };

    var mouseUp=function(e){
        drag=false;
    };

    var mouseMove=function(e) {
        if (!drag) return false;
        if(e.which == 1) {
            var gap_x = e.pageX - original_x;
            var gap_y = e.pageY - original_y;
            
            yRot += gap_x*3/canvas.width;
            xRot += gap_y*3/canvas.height;

            original_x = e.pageX;
            original_y = e.pageY;

            e.preventDefault();
        }
        else if(e.which == 2) {

            var gap_x = e.pageX - original_x;
            var gap_y = e.pageY - original_y;

            model_posx += -gap_x*3/canvas.width;
            model_posy += gap_y*3/canvas.height;

            original_x = e.pageX;
            original_y = e.pageY;
            e.preventDefault();
        }
    };

    var mouseWheel=function(e){
        e.preventDefault();
        if(event.wheelDelta<0) {
            if(fov_degree < 180)
                fov_degree += 1;
        }

        else {
            if(fov_degree > 1)
                fov_degree -= 1;
        }
    }

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("wheel", mouseWheel, false);

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }
    return true;
}

var shaderProgram;
var num_vertex = 36; 
var opacity1 = 1.0; 
var opacity2 = 1.0; 

function resetRot() {
    xRot = 0.0;
    yRot = 0.0;
}

function resetCamera() {
    model_posx = 0.0;
    model_posy = 0.0;
}
function resetZoom() {
    fov_degree = 90.0;
}

function makeCube(sx,sy,sz)
{
    
        var vertexData = [
        // X,Y,Z,           R,G,B,A,                    U,V,        NX,NY,NZ  
        // Backface (RED/WHITE) -> z = 0.5
        -sx, -sy, -sz,      1.0, 0.0, 0.0, 0.0,    0.0,  0.0,  0, 0, -1,
         sx,  sy, -sz,      1.0, 0.0, 0.0, 0.0,    1.0,  1.0,  0, 0, -1,
         sx, -sy, -sz,      1.0, 0.0, 0.0, 0.0,    1.0,  0.0,  0, 0, -1,
        -sx, -sy, -sz,      1.0, 0.0, 0.0, 0.0,    0.0,  0.0,  0, 0, -1,
        -sx,  sy, -sz,      1.0, 0.0, 0.0, 0.0,    0.0,  1.0,  0, 0, -1,
         sx,  sy, -sz,      1.0, 0.0, 0.0, 0.0,    1.0,  1.0,  0, 0, -1,
        // Front (BLUE/WHITE) -> z = 0.5           
        -sx, -sy,  sz,      0.0, 0.0, 1.0, 0.0,    0.0,  1.0,  0, 0, 1,
         sx, -sy,  sz,      0.0, 0.0, 1.0, 0.0,    1.0,  1.0,  0, 0, 1,
         sx,  sy,  sz,      0.0, 0.0, 1.0, 0.0,    1.0,  0.0,  0, 0, 1,
        -sx, -sy,  sz,      0.0, 0.0, 1.0, 0.0,    0.0,  1.0,  0, 0, 1,
         sx,  sy,  sz,      0.0, 0.0, 1.0, 0.0,    1.0,  0.0,  0, 0, 1,
        -sx,  sy,  sz,      0.0, 0.0, 1.0, 0.0,    0.0,  0.0,  0, 0, 1,
        // LEFT (GREEN/WHITE) -> z = 0.5                       
        -sx, -sy, -sz,      0.0, 1.0, 0.0, 0.0,    0.0,  0.0,  -1, 0, 0,
        -sx,  sy,  sz,      0.0, 1.0, 0.0, 0.0,    1.0,  1.0,  -1, 0, 0,
        -sx,  sy, -sz,      0.0, 1.0, 0.0, 0.0,    1.0,  0.0,  -1, 0, 0,
        -sx, -sy, -sz,      0.0, 1.0, 0.0, 0.0,    0.0,  0.0,  -1, 0, 0,
        -sx, -sy,  sz,      0.0, 1.0, 0.0, 0.0,    0.0,  1.0,  -1, 0, 0,
        -sx,  sy,  sz,      0.0, 1.0, 0.0, 0.0,    1.0,  1.0,  -1, 0, 0,
        // RIGHT (YELLOW/WHITE) -> z = 0.5         
         sx, -sy, -sz,      1.0, 1.0, 0.0, 0.0,    0.0,  0.0,  1, 0, 0,
         sx,  sy, -sz,      1.0, 1.0, 0.0, 0.0,    1.0,  0.0,  1, 0, 0,
         sx,  sy,  sz,      1.0, 1.0, 0.0, 0.0,    1.0,  1.0,  1, 0, 0,
         sx, -sy, -sz,      1.0, 1.0, 0.0, 0.0,    0.0,  0.0,  1, 0, 0,
         sx,  sy,  sz,      1.0, 1.0, 0.0, 0.0,    1.0,  1.0,  1, 0, 0,
         sx, -sy,  sz,      1.0, 1.0, 0.0, 0.0,    0.0,  1.0,  1, 0, 0,
        // BOTTON (MAGENTA/WHITE) -> z = 0.5                   
        -sx, -sy, -sz,      1.0, 0.0, 1.0, 0.0,    0.0,  0.0,  0, -1, 0,
         sx, -sy, -sz,      1.0, 0.0, 1.0, 0.0,    1.0,  0.0,  0, -1, 0,
         sx, -sy,  sz,      1.0, 0.0, 1.0, 0.0,    1.0,  1.0,  0, -1, 0,
        -sx, -sy, -sz,      1.0, 0.0, 1.0, 0.0,    0.0,  0.0,  0, -1, 0,
         sx, -sy,  sz,      1.0, 0.0, 1.0, 0.0,    1.0,  1.0,  0, -1, 0, 
        -sx, -sy,  sz,      1.0, 0.0, 1.0, 0.0,    0.0,  1.0,  0, -1, 0,
        // TOP (CYAN/WHITE) -> z = 0.5                         
        -sx,  sy, -sz,      0.0, 1.0, 1.0, 0.0,    0.0,  0.0,  0, 1, 0,
         sx,  sy,  sz,      0.0, 1.0, 1.0, 0.0,    1.0,  1.0,  0, 1, 0,
         sx,  sy, -sz,      0.0, 1.0, 1.0, 0.0,    1.0,  0.0,  0, 1, 0,
        -sx,  sy, -sz,      0.0, 1.0, 1.0, 0.0,    0.0,  0.0,  0, 1, 0,
        -sx,  sy,  sz,      0.0, 1.0, 1.0, 0.0,    0.0,  1.0,  0, 1, 0,
         sx,  sy,  sz,      0.0, 1.0, 1.0, 0.0,    1.0,  1.0,  0, 1, 0 
        ];
        return (new Float32Array(vertexData));
}


function initialiseBuffer() {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    makeCube(0.5,0.5,0.5);
    gl.bufferData(gl.ARRAY_BUFFER, makeCube(0.5,0.5,0.5) , gl.DYNAMIC_DRAW);

    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = `
            precision mediump float;
            uniform mediump vec3 lightPos;
            uniform mediump vec4 lightColor;
            varying highp vec4 col; 
            varying highp vec3 VMv;
            varying highp vec3 VMn; 
            void main(void) 
            { 
                vec3 N = normalize(VMn);
                float  d = length(lightPos - VMv);
                float specular; 
                mediump vec3 lightVec = normalize(lightPos - VMv);
                float diffuse = max(dot(N, lightVec), 0.1);
                diffuse = diffuse * (1.0 / (1.0 + (0.25 * d * d)));
                if (diffuse > 0.0) {
                        vec3 R = reflect(-lightVec, N);      // Reflected light vector
                        vec3 V = normalize(-VMv);    // Vector to viewer
                        // Compute the specular term
                        float specAngle = max(dot(R, V), 0.0);
                        specular = pow(specAngle, 80.0);
                }
                gl_FragColor = col*diffuse + lightColor*specular;
            }`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

// Phong Shading
    var vertexShaderSource = `
        attribute highp vec4 myVertex; 
        attribute highp vec4 myColor; 
        attribute highp vec2 myUV; 
        attribute highp vec3 myNormal; 
        uniform mediump mat4 mMat; 
        uniform mediump mat4 vMat; 
        uniform mediump mat4 pMat; 
        varying highp vec4 col;
        varying highp vec3 VMv;
        varying highp vec3 VMn; 
        void main(void)  
        { 
            VMv = vec3 (vMat * mMat * myVertex);
            VMn = vec3 (vMat * mMat * vec4(myNormal, 0.0));
            col = myColor;
            gl_Position = pMat * vMat * mMat * myVertex;
        }`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    gl.bindAttribLocation(gl.programObject, 2, "myUV");
    gl.bindAttribLocation(gl.programObject, 3, "myNormal");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

var xRot = 0.0;
var yRot = 0.0;
var zRot = 0.0;
var x_trans = 0.0;
var speedRot = 0.01; 
var draw_mode = 4; // 4 Triangles, 3 line_strip 0-Points
var fov_degree = 90.0; 
var mMat, vMat, pMat; 
var depth_clear_value = 1.0; 
var light_posx = 0.0;
var light_posy = 0.0;
var light_posz = 0.0;
var light_r = 1.0;
var light_g = 1.0;
var light_b = 1.0;
var model_posx = 0.0;
var model_posy = 0.0;

function renderScene() {
    
    gl.clearColor(0.4, 0.4, 0.4, 1.0);
    gl.clearDepth(depth_clear_value);                                           // Added for depth Test 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Added for depth Test 
    
    var mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
    var vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
    var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");
    pMat = mat4.create(); 
    vMat = mat4.create(); 
    mMat = mat4.create();

    mat4.perspective(pMat, fov_degree * 3.141592 / 180.0 , canvas.width/canvas.height, 0.5, 1000); 
    mat4.lookAt(vMat, [0,0,2], [model_posx, model_posy, 0.0], [0,1,0]);
    
    mat4.rotateX(mMat, mMat, xRot);
    mat4.rotateY(mMat, mMat, yRot);

    gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
    gl.uniformMatrix4fv(vMatLocation, gl.FALSE, vMat );
    gl.uniformMatrix4fv(pMatLocation, gl.FALSE, pMat );
    
    light_posx = document.getElementById('light_posx').value;
    light_posy = document.getElementById('light_posy').value; 
    light_posz = document.getElementById('light_posz').value;
    light_r = document.getElementById('light_r').value;
    light_g = document.getElementById('light_g').value; 
    light_b = document.getElementById('light_b').value;

    // Set Light Position
    gl.uniform3f(gl.getUniformLocation(gl.programObject, "lightPos"), light_posx, light_posy, light_posz);
    // Set Light Color
    gl.uniform4f(gl.getUniformLocation(gl.programObject, "lightColor"), light_r, light_g, light_b, 1.0);
    
    light_posx_val.innerHTML = light_posx;
    light_posy_val.innerHTML = light_posy;
    light_posz_val.innerHTML = light_posz;
    light_r_val.innerHTML = light_r;
    light_g_val.innerHTML = light_g;
    light_b_val.innerHTML = light_b;


    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 48, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 48, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 48, 28);
    gl.enableVertexAttribArray(3);  
    gl.vertexAttribPointer(3, 3, gl.FLOAT, gl.FALSE, 48, 36);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
  
    gl.drawArrays(draw_mode, 0, num_vertex); 

    if (!testGLError("gl.drawArrays")) {
        return false;
    }
    return true;
}
var canvas;

function main() {
    canvas = document.getElementById("helloapicanvas");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }
    
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
