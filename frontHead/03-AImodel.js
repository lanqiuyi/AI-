document.addEventListener('DOMContentLoaded', function () {
    let layerCount = 0;
    const addLayerBtn = document.getElementById('addLayerBtn');
    const templateBox = document.getElementById('templateBox');
    const layerContainer = document.getElementById('layerContainer');
    const uploadBtn = document.getElementById('uploadBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const uploadSection = document.querySelector('.upload-section');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.querySelector('.image-preview');
    const uploadContainer = document.querySelector('.image-upload-container');
    const modelInfoCard = document.getElementById('modelInfoCard');

    // 模型数据
    const modelData = {
        "openai": {
            name: "OpenAI",
            url: "https://chat.openai.com/",
            logo: "https://logo.clearbit.com/openai.com",
            description: "OpenAI开发的先进AI模型，以强大的自然语言处理能力著称。GPT系列模型支持多任务处理，广泛应用于对话系统、内容生成等领域。"
        },
        "deepseek": {
            name: "DeepSeek",
            url: "https://chat.deepseek.com/",
            logo: "../imgService/deepseek_img.png",
            description: "深度探索公司提出的开源大语言模型，专注于高效推理与长文本处理能力，支持128k超长上下文窗口。在代码理解、数字处理中表现优异。"
        },
        "tencent": {
            name: "腾讯元宝",
            url: "https://yuanbao.tencent.com/",
            logo: "https://logo.clearbit.com/tencent.com",
            description: "腾讯推出的企业级大模型，强调安全性与行业落地应用。支持多模态交互，针对金融、医疗等行业场景有专门优化。"
        }
    };

    // 1. 增加层级功能
    addLayerBtn.addEventListener('click', function () {
        layerCount++;
        const newBox = templateBox.cloneNode(true);
        newBox.id = "";
        newBox.style.display = 'block';
        const layerNum = newBox.querySelector('.layerNum');
        const layerContent = newBox.querySelector('.layer-content');
        layerNum.textContent = `层级 ${layerCount}`;
        layerContent.textContent = "";
        layerContent.dataset.layerId = layerCount;
        layerContainer.appendChild(newBox);

        // 启用上传按钮
        uploadBtn.disabled = false;
    });

    // 2. 上传按钮点击事件
    uploadBtn.addEventListener('click', function () {
        if (layerCount === 0) {
            alert('请选择至少一个模型');
            return;
        }
        modalOverlay.style.display = 'flex';
    });

    // 3. 取消按钮点击事件
    cancelBtn.addEventListener('click', function () {
        modalOverlay.style.display = 'none';

        // 清空输入
        document.querySelector('.projectName').value = '';
        document.querySelector('.textName').value = '';

        // 清空图片预览
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
        uploadContainer.classList.remove('has-image');

        // 重置上传按钮文字
        const uploadText = document.querySelector('.upload-text');
        uploadText.textContent = '上传图片(可选)';

        // 清空文件输入
        imageUpload.value = '';
    });

    // 4. 提交按钮点击事件
    submitBtn.addEventListener('click', function () {
        const projectName = document.querySelector('.projectName').value.trim();
        const textName = document.querySelector('.textName').value.trim();

        if (!projectName) {
            alert('请输入项目名称');
            return;
        }

        if (!textName) {
            alert('请输入文本内容');
            return;
        }

        // 收集层级和模型数据
        const modelList = [];
        const layerElements = document.querySelectorAll('.addLayer');

        layerElements.forEach(layerElement => {
            const layerId = layerElement.querySelector('.layer-content').dataset.layerId;
            const models = [];

            const modelElements = layerElement.querySelectorAll('.added-model');
            modelElements.forEach(modelElement => {
                models.push({
                    modelName: modelElement.textContent,
                    modelType: modelElement.dataset.modelType,
                    weight: 1
                });
            });

            if (models.length > 0) {
                modelList.push({
                    layer: parseInt(layerId),
                    parallel: 0,
                    models: models
                });
            }
        });

        // 准备发送的数据
        const requestData = {
            projectName: projectName,
            content: textName,
            modelList: modelList
        };

        // 如果有图片，转换为base64
        if (imageUpload.files && imageUpload.files[0]) {
            const file = imageUpload.files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                requestData.image = event.target.result.split(',')[1]; // 获取base64部分
                sendRequest(requestData);
            };

            reader.readAsDataURL(file);
        } else {
            sendRequest(requestData);
        }
    });

    // 发送请求到后端
    function sendRequest(data) {
        fetch('http://localhost:3001/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('成功:', data);
                alert('项目提交成功！');
                modalOverlay.style.display = 'none';

                // 清空输入
                document.querySelector('.projectName').value = '';
                document.querySelector('.textName').value = '';
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
                uploadContainer.classList.remove('has-image');
                document.querySelector('.upload-text').textContent = '上传图片(可选)';
                imageUpload.value = '';
            })
            .catch((error) => {
                console.error('错误:', error);
                alert('提交失败，请稍后重试');
            });
    }

    // 5. 上传图片功能
    // 点击上传区域触发文件选择
    uploadSection.addEventListener('click', () => imageUpload.click());

    // 文件选择处理
    imageUpload.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // 验证图片类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }

            // 创建图片预览
            const reader = new FileReader();
            reader.onload = function (event) {
                imagePreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                imagePreview.appendChild(img);
                imagePreview.style.display = 'block';

                // 添加has-image类触发布局变化
                uploadContainer.classList.add('has-image');

                // 更新上传按钮文字
                const uploadText = document.querySelector('.upload-text');
                uploadText.textContent = '更换图片';
            };
            reader.readAsDataURL(file);
        }
    });

    // 6. 拖拽功能实现
    const draggableItems = document.querySelectorAll('.border-style[draggable="true"]');

    draggableItems.forEach(item => {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', this.dataset.model);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    // 为所有放置区域添加事件监听（包括动态创建的）
    document.addEventListener('dragover', function (e) {
        if (e.target.classList.contains('dropzone')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            e.target.classList.add('highlight');
        }
    });

    document.addEventListener('dragleave', function (e) {
        if (e.target.classList.contains('dropzone')) {
            e.target.classList.remove('highlight');
        }
    });

    document.addEventListener('drop', function (e) {
        if (e.target.classList.contains('dropzone')) {
            e.preventDefault();
            e.target.classList.remove('highlight');

            const modelType = e.dataTransfer.getData('text/plain');
            const layerId = e.target.dataset.layerId;

            // 创建已添加的模型元素
            const modelElement = document.createElement('div');
            modelElement.className = 'added-model';
            modelElement.textContent = getModelName(modelType);
            modelElement.dataset.modelType = modelType;

            // 添加到内容区域
            e.target.appendChild(modelElement);

            console.log(`模型 ${modelType} 已添加到层级 ${layerId}`);
        }
    });

    // 7. 模型信息显示
    // 点击模型显示详情卡片
    document.querySelectorAll('.rbDetail').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const modelId = this.closest('.border-style').getAttribute('data-model');
            const data = modelData[modelId];

            // 填充卡片数据
            document.getElementById('modelName').textContent = data.name;
            document.getElementById('modelUrl').href = data.url;
            document.getElementById('modelLogo').src = data.logo;
            document.getElementById('modelDescription').textContent = data.description;

            // 显示卡片
            document.getElementById('modelInfoCard').style.display = 'flex';
        });
    });

    // 关闭卡片
    document.querySelector('.close-btn').addEventListener('click', function () {
        document.getElementById('modelInfoCard').style.display = 'none';
    });

    // 点击外部关闭卡片
    document.getElementById('modelInfoCard').addEventListener('click', function (e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // 辅助函数：获取模型显示名称
    function getModelName(type) {
        const models = {
            'openai': 'Open AI',
            'deepseek': 'DeepSeek',
            'tencent': '腾讯元宝'
        };
        return models[type] || type;
    }
})