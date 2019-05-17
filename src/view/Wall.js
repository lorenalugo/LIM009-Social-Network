import { createPost, getAllPosts, getPublicPosts, updatePost, deletePost, uploadImage } from '../controller/wall.js';
import { getCurrenUser } from '../controller/login.js';
import changeHash from './utils.js';

let postImage;
export const home = (posts) => {
	let user = getCurrenUser();
	let content;
  if (!user.isAnonymous) {
	content = `
	<section id="profile-container" class="profile border-box border">
        <div class="container-background">
			<img class="background-profile" src="../assets/coffe-code.jpg"/>
        </div>
        <div class="container-user">
            ${user.photoURL === null ? `<img class="img-user" src="../assets/perfil-email.jpg"/>` : `<img class="img-user" src="${user.photoURL}"/>`}
            <p id="inf-user"><strong>${user.displayName}</strong><p>    
        </div>
	</section>
	<section class="posts">
	<div id="post-list" class="post-article border-box"></div>
	</section>`;
	
  } else {
  	content = `
  	<a href="#/signUp" title="link de registro">Registrarse</a>
	<section class="posts">
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
	  <input id="post-content-input" type="text" name="post-content" placeholder="¿Qué quieres compartir?" />
	  <img id="btn-upload-image" class="border-box btn-icon bg-green" src="../assets/image.png" alt="subir-imagen" title="subir imagen" />
	  <select id="post-privacy-select">
  		<option value="public">Public</option>
  		<option value="private">Private</option>
	  </select>
	  <input id="input-file" class="none" type="file" />
	  <button id="create-post-btn" type="submit">Compartir</button>
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
		createPost(user.uid, user.displayName, user.photoURL, postDescription, postPrivacy)
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
	const postsList = 
				`<div class="post-article post-head border-box bg-green">
					<div class="col-2">
					${postObject.userPhoto === null ? `<img class="round-image text-center" src="../assets/perfil-email.jpg"/>` : `<img class="round-image clear" src="${postObject.userPhoto}"/>`}
					</div>
					<p class="col-9">Publicado por ${postObject.user}</p>
					<div class="col-1">
					${(user.uid === postObject.userId) ? `<img id="btn-delete-${postObject.id}" class="border-box btn-icon btn-icon-post col-1 bg-green" src="../assets/close.png" alt="eliminar-post" />`: ''}
					</div>
				</div>
				<div class="post-content clear">
				  <textarea id="post-edit-${postObject.id}" class="border-box post-article" disabled=true>${postObject.content}</textarea>
				  ${(postObject.image !== undefined) ? `<img class="image-post" src="${postObject.image}" alt="post-image" title="post image" />` : ``}
				</div>
				<div class="post-article">
				  <img id="likes-count" class="border-box btn-icon btn-icon-post" src="../assets/heart.png" alt="${postObject.likes} likes" title="${postObject.likes}" />
				  ${(user.uid === postObject.userId) ? `<img id="btn-edit-${postObject.id}" class="border-box btn-icon btn-icon-post" src="../assets/paper-plane.png" alt="editar-post" />`: ''}
				  ${(user.uid === postObject.userId) ? `<select id="edit-privacy-${postObject.id}" disabled="true">
				  	${(postObject.state === 'public') ? `<option value="public">Public</option><option value="private">Private</option>` : `<option value="private">Private</option><option value="public">Public</option>`}
	  			  </select>` : ``}
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
		return toggleDisableTextarea(textArea, select, postObject);
	  });
	}
	return article;
}

export const toggleDisableTextarea = (textArea, select, postObject) => {
	if (textArea.disabled && select.disabled) {
		textArea.disabled = false;
		select.disabled = false;
	} else {
		textArea.disabled = true;
		select.disabled = true;
		return updatePost(postObject.id, textArea.value, select.value)
	}
}
