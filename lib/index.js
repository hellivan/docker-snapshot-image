const {existsSync} = require('fs');
const {exec} = require('child_process');
const {resolve} = require('path');

function execCmd(cmd){
	return new Promise((resolve, reject) =>{
		exec(cmd, (err, stdout, stderr) => {
			if (err) return reject(err);
			resolve(stdout.trim());
		});
	});
}

function getCommitHash(){
	return execCmd('git rev-parse --short HEAD');
}

function getPackageInfo(){
	const pkgPath = resolve('./package.json');

	return Promise.resolve()
		.then(()=>{
			if(!existsSync(pkgPath)) throw new Error('package.json not not found in cwd!');
			return require(pkgPath);
		});
}

function createImage(tag){
	const command = `docker build --force-rm -t ${tag} ./`;
	return Promise.resolve()
		.then(() => console.log(`Creating image using command '${command}'`))
		.then(() => execCmd(command))
		.then(() => tag);
}

function tagImage(existingTag, newTag){
	const command = `docker tag ${existingTag} ${newTag}`;
	return Promise.resolve()
		.then(() => console.log(`Tagging image using command '${command}'`))
		.then(() => execCmd(command))
		.then(() => existingTag);
}


function createOrTag(existingTag, newTag){
	if(!existingTag) return createImage(newTag);
	return tagImage(existingTag, newTag);
}


module.exports.createImage = function({imageName, fixedTag, autoTag}){
	return Promise.all(
		[
			getCommitHash(),
			getPackageInfo()
		])
		.then(([commitHash, info]) => {
			let p = Promise.resolve();
			
			imageName = imageName || info.name;
			let defaultTag = `${info.version}-${commitHash}`
			
			if(autoTag) {
				p = p.then((dockerImage) => createOrTag(dockerImage, `${imageName}:${defaultTag}`));
			}

			
			if(fixedTag) {
				p = p.then((dockerImage) => createOrTag(dockerImage, `${imageName}:${fixedTag}`));
			}
			
			return p;
		});
	
}
