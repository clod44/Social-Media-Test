


/* 
    note: the reas on why we see images update twice at first, its because
    our image sources are empty "" which triggers onError attribute of them.
    which ultimately means find a new image. but while these async things happening..
    we are calling the randomizeUserPost(). because we want new images and texts. 
    Avoidable.. but meh
*/
randomizeUserPost();


let totalPostsLoaded = 0;
let totalPostsWillLoad = 0;
const loadMorePostsRate = 5;
updateHomePage(loadMorePostsRate);//get X latest posts from database
const loadMorePostsBtn = document.getElementById("load-more-posts");
loadMorePostsBtn.addEventListener("click",updateHomePage);
//^this triggers the function at load for somereason so I won't trigger it again



function uploadImage(event, img_id){
    //blob
    document.getElementById(img_id).src = URL.createObjectURL(event.target.files[0]);
}


const uploadUserPic = document.getElementById("upload-user-picture");
uploadUserPic.addEventListener("onchange",(event)=>{
    uploadImage(event,"edit-user-picture");
})
const uploadUserPostPic = document.getElementById("upload-user-post-picture");
uploadUserPostPic.addEventListener("onchange",(event)=>{
    uploadImage(event,"edit-user-post-picture");
})


const publishBtn = document.getElementById("publish");
publishBtn.addEventListener("click",sendPost);   

async function sendPost(){
    const userPicture = document.getElementById("edit-user-picture");
    const userPicture64 = getBase64Image(userPicture, "small");
    const userName = document.getElementById("edit-user-name").value;
    const userPostText = document.getElementById("edit-user-post-text").value;
    const userPostPicture = document.getElementById("edit-user-post-picture");
    const userPostPicture64 = getBase64Image(userPostPicture, "big");
    const timestamp = Date.now();
    const userLikesCount = 0;
    if(userName.length < 1 || userPostText.length < 1){
        alert("something went wrong while publishing this post");
        return;
    }
    const data = {userPicture64, userName, userPostText, userPostPicture64, userLikesCount, timestamp};
    const options = {
        method:  "POST",
        headers: {
            "Content-Type":"application/json"//point out that data needs to be parsed via JSON
        },
        body: JSON.stringify(data) //data that server will parse and read
    }

    const infoText = document.getElementById("post-upload-status");
    infoText.textContent = `timestamp: ${Date.now()}\n
                            date: ${Date.now().toLocaleString()}\n
                            status: uploading`;
    const response = await fetch("/database/send",options);
    const json = await response.json();
    infoText.textContent = `timestamp: ${json.timestamp}\n
                            date: ${json.timestamp.toLocaleString()}\n
                            status: ${json.status}\n
                            id: ${json.id}`;
    console.log(json);

    function getBase64Image(img,size) {
        const canvas = document.createElement("canvas");
        if(size=="big"){
            canvas.width = Math.min(img.naturalWidth, 500);
            canvas.height = Math.min(img.naturalHeight,300);
        }else if(size=="small"){
            canvas.width = Math.min(img.naturalWidth, 100);
            canvas.height = Math.min(img.naturalHeight,80);
        }
        const ctx = canvas.getContext("2d");
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/png",0.5);
    }
}


const randomizeBtn = document.getElementById("randomize-user-post");
randomizeBtn.addEventListener("click",randomizeUserPost);

async function randomizeUserPost(){
    const userPicture = document.getElementById("edit-user-picture");
    const userName = document.getElementById("edit-user-name");
    const userPostText = document.getElementById("edit-user-post-text");
    const userPostPicture = document.getElementById("edit-user-post-picture");
    
    const response = await fetch('https://animechan.vercel.app/api/random');
    const data = await response.json();

    userName.value = data.character;
    userPostText.value = data.quote;
    userPicture.src = getRandomImagePath();
    userPostPicture.src = getRandomImagePath();
    userPicture.naturalWidth = 100;
    userPicture.naturalHeight = 100;
    userPostPicture.naturalWidth = 400;
    userPostPicture.naturalHeight = 300;
    
    function getRandomImagePath(){
        const r = Math.floor(Math.random()*23);
        return `/resources/random_images/${r}.jpg`;
    }
}






async function updateHomePage(){
    totalPostsWillLoad += loadMorePostsRate;
    console.log(`updating home page...\ntotal posts loaded: ${totalPostsLoaded},\ntotal posts will load: ${totalPostsWillLoad}`);
    

    const response = await fetch(`/database/${totalPostsWillLoad}`);
    const posts = await response.json();
    //console.log(posts);
    if(totalPostsWillLoad > posts.length+loadMorePostsRate){
        alert("no more posts found on the database");
        return;
    }
    
    for (let postIndex = totalPostsLoaded; postIndex < Math.min(totalPostsWillLoad,posts.length); postIndex++) {
        const post = posts[postIndex];
        createHomePagePost( post._id,
                            post.userName,
                            post.userPicture64,
                            post.userPostText,
                            post.userPostPicture64,
                            post.userLikesCount,
                            post.timestamp);
    }



    function createHomePagePost(_id,_userName,_userPicture,_userPostText,_userPostPicture, _userLikesCount, _timestamp){
        const post = document.createElement("div");
        const postId = document.createElement("div");
        const timestamp = document.createElement("div");
        const userPicture = document.createElement("img");
        const userName = document.createElement("div");
        const userPostText = document.createElement("div");
        const userPostPicture = document.createElement("img");
        const userLikes = document.createElement("div");
        const userLikesIcon = document.createElement("img");
        const userLikesCount = document.createElement("div");

        post.classList.add('post');
        timestamp.classList.add('timestamp');
        userPicture.classList.add('user-picture');
        userName.classList.add('user-name');
        userPostText.classList.add('user-post-text');
        userPostPicture.classList.add('user-post-picture');
        userLikes.classList.add("user-likes");
        userLikesIcon.src = "/resources/heart.png";
        userLikesIcon.classList.add('user-likes-icon');
        userLikesCount.classList.add('user-likes-count');
        postId.classList.add("user-postId");


        timestamp.textContent = new Date(_timestamp).toLocaleString();
        userPicture.src = _userPicture;
        userName.textContent = _userName;
        userPostText.textContent = _userPostText;
        userPostPicture.src = _userPostPicture;
        userLikesCount.textContent = _userLikesCount;
        postId.textContent = _id;
        userLikesIcon.textContent = _id;


        userLikes.append(userLikesIcon,userLikesCount);
        post.append(postId,userPicture,userName,userPostText,userPostPicture,userLikes,timestamp);
        
        const userPostsArea = document.getElementById("user-posts-container")
        userPostsArea.append(post);
        totalPostsLoaded++;
    }

    
    //add like functionality to all like icons
    const likeIcons = document.querySelectorAll(".user-likes-icon");
    for (const icon of likeIcons) {
        icon.removeEventListener("click", requestLike);
        icon.addEventListener("click",requestLike);  
            
        async function requestLike(){
            console.log("liking... id: " + icon.textContent);
            const options = {
                method:  "POST",
                headers: {
                    "Content-Type":"application/json"//point out that data needs to be parsed via JSON
                },
                body: JSON.stringify({id: icon.textContent}) //data that server will parse and read
            }
            const response = await fetch("database/like",options);
            const json = await response.json();
            const iconText = icon.parentElement.querySelector(".user-likes-count");
            iconText.textContent = parseInt(iconText.textContent) + parseInt(json.userLikesCount);
        };  
    }
}

   







