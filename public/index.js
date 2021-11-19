


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


const publishBtn = document.getElementById("publish");
publishBtn.addEventListener("click",sendPost);   

async function sendPost(){
    const userPicture = document.getElementById("edit-user-picture");
    const userPicture64 = getBase64Image(userPicture);
    const userName = document.getElementById("edit-user-name").value;
    const userPostText = document.getElementById("edit-user-post-text").value;
    const userPostPicture = document.getElementById("edit-user-post-picture");
    const userPostPicture64 = getBase64Image(userPostPicture);
    const timestamp = Date.now();
    const userLikesCount = 0;

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

    function getBase64Image(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
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
    userPicture.src = getRandomImageUrl(200,200,10);
    userPostPicture.src = getRandomImageUrl(400,400,10);
}

function getRandomImageUrl(width,height){
    const id = Math.floor(Math.random()*1000);
    const image_url = `https://picsum.photos/id/${id}/${width}/${height}`;
    /*
        sometimes this url return an error. in that case we put 
        onError=checkState(this,width,height) 
        to post pic and pfp pic dom elements
    */
    return image_url;
}

function checkState(object, width, height){
    object.src = getRandomImageUrl(width, height)
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

   







