function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}
// --------------------------------------------------------------------------
function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function removeProductFromCart(item) { // Remove o produto do localStorage
  const savedItems = JSON.parse(localStorage.getItem('productItems')); // Carrega todos os itens do localStorage
  const itemToRemove = item.innerText; // Carrega a descrição item a ser removido
  const skuItemToRemove = itemToRemove.substring(5, 18); // Extrai o sku (id) da descrição do item a ser removido
  console.log(skuItemToRemove);
  for (let i = 0; i < savedItems.length; i++) { // QUAL É O PROBLEMA COM O INCREMENTO?
    if (savedItems[i].sku === skuItemToRemove) { // Percorre todos os itens comparando os sku
      savedItems.splice(i, 1); // Remove o item.
      break; // Interrompe o laço
    }
  }
  // savedItems.forEach((element) => {
  //   if (savedItems.sku === skuItemToRemove) {
  //     savedItems.splice(element, 1);
  //   }
  // });
  localStorage.setItem('productItems', JSON.stringify(savedItems));

  console.log(savedItems);
}

function cartItemClickListener(event) { // PRECISA FAZER REPAROS
  const item = event.path[0]; // LEMBRAR DE REMOVER ISSO.
  const ol = document.querySelector('.cart__items'); // Mapeia a lista de itens
  ol.removeChild(item); // Remove o item clicado.
  removeProductFromCart(item); // Chama a função para remover também do localStorage
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function saveProductFromCart(item) { // Salva produtos do carrinho para recarregamento da pagina
  const savedItems = localStorage.getItem('productItems'); // Carrega os itens do localStorage
  if (savedItems) { // Se tiver algo no já salvo no localStorage, então junte o novo item e salve
    const itemsToSave = JSON.parse(savedItems); // "Itens para salvar" recebe os itens que estavam salvos no localStorage
    itemsToSave.push(item); // O novo item é adicionado.
    localStorage.setItem('productItems', JSON.stringify(itemsToSave));
  } else { // Senão salva o primeiro item do carrinho
    const firstItemToSaved = [item];
    localStorage.setItem('productItems', JSON.stringify(firstItemToSaved));
  }
}

async function addProductToCart(event) { // PRECISA FAZER REPAROS
  // console.log(event.path); // PROVISÓRIO P/ PEGAR O ELEMENTO, DESFAZER ESSA GAMBIARRA
  const item = event.path[1]; // LEMBRAR DE MUDAR ISSO
  const skuItem = getSkuFromProductItem(item); // Busca pelo "id" ou "sku" do item.
  const itemData = await fetch(`https://api.mercadolibre.com/items/${skuItem}`); // Faz requisição a API com identificação do item
  const itemDataInJson = await itemData.json(); // Transforma os dados da requisição em JSON
  const productItem = { // Separa os dados necessários do item
    sku: itemDataInJson.id,
    name: itemDataInJson.title,
    salePrice: itemDataInJson.price,
  };
  saveProductFromCart(productItem); // Chama a função que salva itens do carrinho no localStorage

  const ol = document.querySelector('.cart__items'); // Mapeia a ol que vai abrigar os itens do carrinho
  ol.appendChild(createCartItemElement(productItem)); // Anexa o item criado na ol
}

function productListing(items) { // Mapeia a section e anexa os produtos
  const sectionItems = document.querySelector('.items'); // Aponta para a section
  items.forEach((item) => { // Percorre todos os itens adicionando-os a section
    const element = createProductItemElement(item); // Chama a função de criar item passando como parâmetro o elemento atual
    element.querySelector('button').addEventListener('click', addProductToCart); // Adiciona um evento de click já que o botão não tem "onclick"
    sectionItems.appendChild(element); // Anexa o elemento criado a section
  });
}

async function getProductAPI() { // Carrega os dados do endpoint.
  try {
    const dataLoad = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador'); // Dados "brutos"
    const dataInJson = await dataLoad.json(); // Dados em formato json
    const products = dataInJson.results.map((product) => ({ // Criando um novo array somente com os dados necessarios
      sku: product.id,
      name: product.title,
      image: product.thumbnail,
    }));
    productListing(products); // Chama a função responsável por listar os produtos
  } catch (error) {
    console.log(error); // Se der erro, mostre-o.
  }
}

function init() { // Função inicial que checa se é a primeira vez que a pagina é aberta ou não.
  const savedItems = localStorage.getItem('productItems'); // Carrega os itens do localStorage
  if (savedItems) { // Se tiver algo no já salvo no localStorage, então carrega os dados no carrinho
    const itemsToLoad = JSON.parse(savedItems); // "Itens para carregar" recebe os dados do localStorage
    const ol = document.querySelector('.cart__items'); // Mapeia a ol que vai abrigar os itens do carrinho (fora do forEach pois a leitura do DOM é "caro")
    // console.log(JSON.parse(savedItems));
    
    itemsToLoad.forEach((item) => { // Percorre todos itens do array
      ol.appendChild(createCartItemElement(item)); // Cria o tem e anexa o item criado na ol     
    });
    
    getProductAPI(); // Chama a função que faz a carga dos dados.
  } else { // Senão começa tudo do 0
    getProductAPI(); // Chama a função que faz a carga dos dados.
  }
}

window.onload = () => {
  init(); // Chamada da primeira função ("start" da aplicação)
};
