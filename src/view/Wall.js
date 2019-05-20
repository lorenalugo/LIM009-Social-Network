import { createPost, getAllPosts, getPublicPosts, updatePost, deletePost, uploadImage, likePost, addCommentPost, getAllComentPost} from '../controller/wall.js';
import { getCurrenUser } from '../controller/login.js';
import changeHash from './utils.js';

let postImage;
export const home = (posts) => {
	let user = getCurrenUser();
	let content;
  if (!user.isAnonymous) {
	content = `
	<section id="profile-container" class="profile border-box">
        <div class="container-background">
			<img class="background-profile" src="../assets/coffe-code.jpg"/>
        </div>
        <div class="container-user">
            ${user.photoURL === null ? `<img class="img-user" src="../assets/perfil-email.jpg"/>` : `<img class="img-user" src="${user.photoURL}"/>`}
            ${user.displayName === null ? `<p id="inf-user"><strong> ${user.email}</strong><p>`:`<p id="inf-user"><strong>${user.displayName}</strong><p>` }  
        </div>
	</section>
	<section class="posts">
	<div id="post-list" class="post-list post-article border-box"></div>
	</section>`;
	
  } else {
  	content = `
  	<a href="#/login" title="link de iniciar sesion">Iniciar Sesión</a>
	<section class="posts post-list">
	<div id="post-list" class="post-article border-box"></div>
	</section>`;
  }
  const contentContainer = document.createElement('main');
	contentContainer.classList.add('flex-container', 'border-box', 'main-container');
	contentContainer.innerHTML = content;
    const wallAll = contentContainer.querySelector('#post-list');
    if (!user.isAnonymous) {wallAll.appendChild(createPostTemplate())};
    posts.forEach((post) => {
      wallAll.appendChild(postListTemplate(post));    
    });

	return contentContainer;
}

export const createPostTemplate = () => {
	const createPostContainer = document.createElement('div');
	createPostContainer.classList.add('post-article', 'post-box', 'border');
	createPostContainer.setAttribute('id', 'create-post-container');
	const createPostForm = `
	<form>
	  <input id="post-content-input" class="block post-input" type="text" name="post-content" placeholder="¿Qué quieres compartir?" />
	  <div class="btn-post-input">
	  <img id="btn-upload-image" class="block border-box btn-icon-post bg-green" src="../assets/image.png" alt="subir-imagen" title="subir imagen" />
	  <select id="post-privacy-select" class="block select bg-green color-white border-none">
  		<option value="public">Public</option>
  		<option value="private">Private</option>
	  </select>
	  <button id="create-post-btn" type="submit" class="block btn-share bg-green color-white">Compartir</button>
	  </div>
	  <input id="input-file" class="none" type="file" accept="image/*" />
	</form>`;
	createPostContainer.innerHTML = createPostForm;
	postImage = createPostContainer.querySelector('#input-file');
	const uploadImageBtn = createPostContainer.querySelector('#btn-upload-image');
	uploadImageBtn.addEventListener('click', () => {
		postImage.classList.remove('none');
	});    
	const createPostBtn = createPostContainer.querySelector('#create-post-btn');
    createPostBtn.addEventListener('click', createPostOnClick);
	return createPostContainer;
}

export const createPostOnClick = (event) => {
	event.preventDefault();
	const formElem = event.target.closest('form')
	const postDescription = formElem.querySelector('#post-content-input').value;
	const postPrivacy = formElem.querySelector('#post-privacy-select').value;
	const user = getCurrenUser();
	if (user && postDescription !== '') {
		document.getElementById('post-list').innerHTML = '';
		if (postImage.files[0] == undefined) {
		createPost(user.uid, user.displayName || user.email , user.photoURL, postDescription, postPrivacy)
		.then((response) => getAllPosts(postListTemplate));
	    } else {
	    	const date = new Date().toString();
	    	console.log(date);
	    	uploadImage(date, postImage.files[0])
	    	.then((url) => createPost(user.uid, user.displayName, user.photoURL, postDescription, postPrivacy, url))
	    	.then((response) => getAllPosts(postListTemplate));
	    }
		formElem.querySelector('#post-content-input').value = '';
	}

}

export const postListTemplate = (postObject) => {
	const user = getCurrenUser();
	/*const date = (postObject.date.toDate()).toString();
  const newDate = date.substr(4, date.length - 37);*/
	const postsList = 
				`<div class="post-article post-head border-box bg-green">
					<div class="col-2">
					${postObject.userPhoto === null ? `<img class="round-image text-center" src="../assets/perfil-email.jpg"/>` : `<img class="round-image clear" src="${postObject.userPhoto}"/>`}
					</div> 
					${postObject.user === null ? `<p class="col-9">Publicado por ${user.email}</p>`:`<p class="col-9">Publicado por ${postObject.user}</p>` } 
					<div class="col-1">
					${(user.uid === postObject.userId) ? `<img id="btn-delete-${postObject.id}" class="block border-box btn-delete col-1 bg-green" src="../assets/close.png" alt="eliminar-post" />`: ''}
					</div>
				</div>
				<div class="post-content clear">
				  <textarea id="post-edit-${postObject.id}" class="border-box post-article textarea" disabled=true>${postObject.content}</textarea>
				  ${(postObject.image !== undefined && postObject.image !== null) ? `<img class="image-post" src="${postObject.image}" alt="post-image" title="post image" />` : ``}
				</div>
        <div class="post-article bg-light-green post-footer border-box">
				  <img id="btnLike-${postObject.id}" class="border-box btn-icon-post bg-green" src="../assets/como.png" alt=" likes" title="" /> <span class="post-total-like registry">${postObject.likes}</span>
				  ${(user.uid === postObject.userId) ? `<img id="btn-edit-${postObject.id}" class="border-box btn-icon btn-icon-post bg-green" src="../assets/paper-plane.png" alt="editar-post" />`: ''}
					${(!user.isAnonymous) ? `<img id="comments-${postObject.id}" class="border-box btn-icon btn-icon-post bg-green" src="../assets/comments.png" alt="ver-comments" />` : '' }
					${(user.uid === postObject.userId) ? `<select id="edit-privacy-${postObject.id}" class="select-privacy select bg-green color-white border-none" disabled="true"> likes 2 Comentarios 
				  	${(postObject.state === 'public') ? `<option value="public">Public</option><option value="private">Private</option>` : `<option value="private">Private</option><option value="public">Public</option>`}
						</select>` : ``}
				</div>
				<div id="comment-content-${postObject.id}" class="border-box post-article post-comment">
				<div id="comment-content-${postObject.id}" ></div>
				<div id="comments-content-${postObject.id}" ></div>
				</div>`;
	const article = document.createElement('article');
	article.setAttribute('id', postObject.id);
	article.classList.add('post-box', 'border');
	article.innerHTML = postsList;
	if (user.uid === postObject.userId) {
	  const deleteBtn = article.querySelector(`#btn-delete-${postObject.id}`);
	  deleteBtn.addEventListener('click', () => {
		deletePost(postObject.id)
	  });
	  const editBtn = article.querySelector(`#btn-edit-${postObject.id}`);
  	  const textArea = article.querySelector(`#post-edit-${postObject.id}`);
  	  const select = article.querySelector(`#edit-privacy-${postObject.id}`);
  	  editBtn.addEventListener('click', () => {
		return toggleDisableTextarea(textArea, select, postObject, editBtn);
      });
		}
    const btnLike = article.querySelector(`#btnLike-${postObject.id}`);
    btnLike.addEventListener('click',  () => {
			const number = postObject.likes;
			return toggleLikes(btnLike, number, postObject);
		});
		
		const btnComments = article.querySelector(`#comments-${postObject.id}`);
		 btnComments.addEventListener('click', () => {
      const divComment = article.querySelector(`#comment-content-${postObject.id}`)
      divComment.appendChild(commentTemplate(postObject.id))
		})

		const divComments = article.querySelector(`#comments-content-${postObject.id}`)
		getAllComentPost(postObject.id, (comments) => {
			divComments.innerHTML = '';
			comments.forEach(comment => {
				divComments.appendChild(commentListTemplate(comment))
			});
		})
		

	return article;
}




const commentTemplate = (id) => {
  const divContentComment = document.createElement('div');
  divContentComment.innerHTML = `
	<input id="comment-content-input" class="block post-input" type="text" name="comment-content" placeholder="¿Qué quieres comentar?" />
	<button id="btn-comment-post" type="submit" class="block btn-share bg-green color-white">Comentar</button>
	`;
	const btnComment = divContentComment.querySelector('#btn-comment-post');
	const currentComment= divContentComment.querySelector('#comment-content-input');
  btnComment.addEventListener('click', () => {
		addCommentPost(id, currentComment.value);
  })
  return divContentComment;
}

const commentListTemplate = (commentsObject) => {
	const commentList = `<textarea id="post-edit-${commentsObject.id}" class='border-box input-comment bg-white border' disabled=true>${commentsObject.commentPost}</textarea>
	`;
	const article = document.createElement('article');
	article.setAttribute('id', commentsObject.id);
	article.classList.add('post-box', 'border');
	article.innerHTML = commentList;
		
	return article;
}


export const toggleDisableTextarea = (textArea, select, postObject, btn) => {
	if (textArea.disabled && select.disabled) {
		btn.src = "../assets/save.png";
		textArea.disabled = false;
		select.disabled = false;
	} else {
		btn.src = "../assets/paper-plane.png";
		textArea.disabled = true;
		select.disabled = true;
		return updatePost(postObject.id, textArea.value, select.value)
	}
}

export const toggleLikes = (btn, number, postObject) =>  {
	if(btn.src ="../assets/como.png"){
		btn.src = "../assets/heart.png";
		number = number+1;
		return  likePost(postObject.id,number);
	} else {
		btn.src = "../assets/como.png";
		number = number-1;
		return  likePost(postObject.id,number);
	}
}

