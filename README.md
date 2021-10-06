
# Computer Graphics Final Project:  <br> Mouse Drag Interface for Transformation of Camera


## Introduction

컴퓨터 그래픽스에서 배운 내용을 토대로 mouse control event를 이용한 여러가지 Transformation을 구현해보았으며 여기에 Phong Shading의 Specular Lighting을 추가하였다.  구현한 Transformation은 순차적으로 rotation, scale, 그리고 camera position이 있으며, Specular Lighting에는 빛의 위치과 색깔을 바꿀 수 있도록 만들었다.



## 1. Transformation

### Rotation
```
var drag=false;
var original_x, original_y;
    
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
    ...
};
canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);
canvas.addEventListener("wheel", mouseWheel, false);
```
Rotation은 마우스 좌클릭 후 드래그로 구현하였다.  우선 mouseUp, mouseDown을 이용해 마우스가 눌리면 drag를 활성화시키고 뗐을 때, 다시 drag를 비활성화 시킨다. 마우스가 눌렸을 때, 좌클릭인지 스크롤클릭인지를 판단하여 좌클릭이라면 (e.which=1), mouseMove시 회전 각도를 조정한다.

조정된 회전 각도는 renderScene()에서 mat4 모듈의 rotate 함수를 통해 화면에 변화된 cube가 rendering된다. 이때, 각 축에 대한 회전을 따로 주어야하므로 rotateX()에는 x축으로 회전된 각도를, rotateY()에는 y축으로 회전된 각도를 각각 전달한다.
```
function renderScene() {
    ...
    mat4.rotateX(mMat, mMat, xRot);
    mat4.rotateY(mMat, mMat, yRot);
    ...
}
```
### Scale

물체의 크기 변환은 마우스 스크롤 event를 이용한다. 실질적으로 물체가 커지는 것은 아니며 FOV를 이용하였는데, 그 이유는 다음과 같다. 만약, 물체의 크기를 scale() 함수로 조정하였다면, 현재 적용된 Specular Lighting과 별개로 물체의 크기만 커지기 때문에, 대신 fov를 컨트롤하여 스크롤 event시 빛의 크기도 같이 커지거나 줄어드는 효과를 나타내도록 구현하였다. 아리 코드는 mouseWheel의 함수이며 fov_degree를 변경시키도록 하였는데 이때, 각도가 0이거나 180도를 넘어간다면 큐브가 사라지거나 갑자기 커지는 현상이 일어나므로 이를 사전 차단 시켜주었다. 
```
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
```

마찬가지로 renderScene()에서 mat4 모듈의 perspective() 함수에 fov_degree를 넣어주었는데, 이때 값이 radian이어야 하므로 Pi를 곱하고 180도로 나누었다.
```
function renderScene() {
    ...
    mat4.perspective(pMat, fov_degree * 3.141592 / 180.0 , canvas.width/canvas.height, 0.5, 1000); 
    ...
}
```
Transformation의 마지막으로 카메라 위치 조정을 구현하였는데, 이는 스크롤 클릭-드래그로 구현되었다. mouseMove시 적용된 클릭이 스크롤 클릭이라면(e.which = 2) 그에 맞춰 model position을 수정하였다.
```
var mouseMove=function(e) {
    ...
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
```
수정된 model position은 renderScene()에서 lookAt 함수를 통해 조정되었다. model position이 움직이는 것은 카메라가 반대로 움직이는 것과 같은 효과이므로 카메라의 위치 변경을 model이 움직임으로써 일어나도록 구현하였다.
```
function renderScene() {
    ...
    mat4.lookAt(vMat, [0,0,2], [model_posx, model_posy, 0.0], [0,1,0]);
    ...
}
```

### Reset
테스트를 해본 후, 다시 원점으로 돌아갈 수 있도록 회전, 크기 조정, 카메라 이동에 대한 reset 함수도 추가하였다.

```
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
```

## 2. Light Effect

물체의 transformation만 넣으니 조금 아쉽다는 생각이 들어 조금 더 사실적인 그림을 만들기 위해 Phong Shading의 Specular Lighting을 이용하였다. Light의 구현은 교수님의 실습 강의를 이용하였으며, light의 위치 변경 및 색상 변경을 추가해보았다.



> Specular lighting이란?
>* Specular lighting은 물체의 표면이 반짝거리는 듯한 효과를 준다. Diffuse lighting만으로는 금속, 플라스틱, 물 등의 물체를 효과적으로 표현하지 못하는데, specular lighting은 이에 대한 보완점을 가지고 있다.
>* 정반사는 매끈한 표면에서 일어나므로, 입사하는 빛이 표면에 반사될 때, 난반사와 같이 모든 방향에서 반사된 빛을 볼 수 있는 것이 아니라, 특정한 방향에서만 이 빛을 볼 수 있다. Specular lighting을 표현하는 여러 모델에서는  **어떤 방향**에서,  **얼마나**  이 빛을 볼 수 있는지 정의한다.

Specular lighting을 구현하기 위해서는 빛의 세기를 계산하는 fragment shader에서 노말 벡터를 알고 있어야한다. 노말 벡터는 물체에서 카메라를 향하는 벡터로 vertex shader에서 계산할 수 있으며 이때 얻어온 값으로 fragment shader에서 이용된다.

#### VertexShader
``` 
var vertexShaderSource = `
    attribute highp vec4 myVertex; 
    attribute highp vec4 myColor; 
    attribute highp vec2 myUV; 
    attribute highp vec3 myNormal; 
    ...
    void main(void)  
    { 
        VMv = vec3 (vMat * mMat * myVertex);
        VMn = vec3 (vMat * mMat * vec4(myNormal, 0.0)); // 노말 벡터 계산
        col = myColor;
        gl_Position = pMat * vMat * mMat * myVertex;
    }`;
```

#### FragmentShader

```
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
```

## 3. Controlling Light Effect

 생성된 Specular Light의 위치와 색 변경을 위해서 light position x,y,z와 light color r,g,b 변수를 생성하고, renderScene()에서 index.html로 생성된 input range 값에 따라 light_pos와 light_color를 변경해주었다.  변경은 Uniform을 사용하였는데, uniform이란 Global variable로 모든 단계의 shader에서 접근 가능하며 특정 값을 설정 또는 reset하기 전까지 계속 해당 값을 유지하고 있는다.

#### script.js
```
var light_posx = 0.0;
var light_posy = 0.0;
var light_posz = 0.0;
var light_r = 1.0;
var light_g = 1.0;
var light_b = 1.0;
...
function renderScene() {
	...    
    light_posx = document.getElementById('light_posx').value;
    light_posy = document.getElementById('light_posy').value; 
    light_posz = document.getElementById('light_posz').value;
    light_r = document.getElementById('light_r').value;
    light_g = document.getElementById('light_g').value; 
    light_b = document.getElementById('light_b').value;
    ...
    // Set Light Position
    gl.uniform3f(gl.getUniformLocation(gl.programObject, "lightPos"), light_posx, light_posy, light_posz);
    
    // Set Light Color
    gl.uniform4f(gl.getUniformLocation(gl.programObject, "lightColor"), light_r, light_g, light_b, 1.0);
}   
```

<br>
Light 위치와 색을 변경할 수 있도록 만들어주는 input range 생성 방식
#### index.html

```

		<div style="display: inline-block;">
			<p style="text-align: center;">
        	Light Position (<span id="light_posx_val">0</span>, 
        	<span id="light_posy_val">0</span>, 
        	<span id="light_posz_val">0</span>)
        	</p>
	       	<div>
	           	<span style="background-color:cadetblue;">X: -2.0 <input type="range" min="-2.0" max="2.0" step="0.01" value="0" id="light_posx"> +2.0 </span>
	        </div>
	        <div>
	        	<span style="background-color:cadetblue;">Y: -2.0 <input type="range" min="-2.0" max="2.0" step="0.01" value="0" id="light_posy"> +2.0 </span>
	        </div>
	        <div>
	          	<span style="background-color:cadetblue;">Z: -2.0 <input type="range" min="-2.0" max="2.0" step="0.01" value="0" id="light_posz"> +2.0 </span>
	        </div>
	    </div>

	    <div style="display: inline-block;">
	    	<p style="text-align: center;">
        	Light Color (<span id="light_r_val">0</span>, 
        	<span id="light_g_val">0</span>, 
        	<span id="light_b_val">0</span>)
        	</p>

	    	<div>
	        	<span style="background-color:red;">R: 0.0 <input type="range" min="0.0" max="2.0" step="0.01" value="1.0" id="light_r"> +2.0 </span>
	        </div>
	        <div>
	        	<span style="background-color:green;">G: 0.0 <input type="range" min="0.0" max="2.0" step="0.01" value="1.0" id="light_g"> +2.0 </span>
	        </div>
	        <div>
	        	<span style="background-color:blue;">B: 0.0 <input type="range" min="0.0" max="2.0" step="0.01" value="1.0" id="light_b"> +2.0 </span>
	        </div>
```


## Reference

### Internal Reference
- https://github.com/hwan-ajou/webgl-1.0/tree/main/T12_Shading
- https://git.ajou.ac.kr/hwan/webgl-tutorial/-/tree/master/student2020/better_project/201721097
- https://git.ajou.ac.kr/hwan/webgl-tutorial/-/tree/master/student2020/better_project/201420993
### External Reference
- https://www.w3schools.com/jsref/obj_mouseevent.asp
- https://glmatrix.net/docs/module-mat4.html
- https://inhibitor1217.github.io/2019/05/18/webgl-specular-lighting.html