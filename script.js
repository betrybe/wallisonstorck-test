/**
 * Definição de strings que vão ser repetidas algumas vezes durante o codigo
 */
const classNames = {
  LOADING: '.loading',
  ITEMS: '.items',  
  TOTAL_PRICE: '.total-price',
  CART_ITEMS: '.cart__items',
};

/**
 * Função para criação da imagem dos itens, ela
 * recebe como parâmetro o link da imagem do item,
 * cria e o retorna a outro função que o solicitou.
 */
function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

/**
 * Função também responsável por criar itens,
 * ela atua juntamente com a "createProductItemElement"
 * ao ser chamada ela cria qualquer item necessário
 * como spans, buttons, basta passar o nome do item,
 * classe e texto.
 */
function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

/**
 * A função responsável por criar os card dos itens,
 * ela é invocada dentro da função "productListing",
 * cria o item e retorna-o.
 */
function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

/**
 * Função que retorna o sku do item, ao passar
 * um item para essa função ela retornará uma
 * string com o código "MLB"
 */
function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

/**
 * Essa função soma o valor de todos os itens do carrinho,
 * ela é chamada toda vez que precisa-se atualizar o valor total.
 */
function calculateTotalPrice() { 
  const items = JSON.parse(localStorage.getItem('productItems')); // Carrega todos os itens do localStorage 
  const spanTotalPrice = document.querySelector(classNames.TOTAL_PRICE); // Mapeia o elemento que mostra o valor total 

  if (items) { 
    // Usamos o 'reduce' um metodo que usa dois parâmetros, um acumulador ou "contador" e o valor corrente, inicializando com 0.
    const sumOfValues = items.reduce((accumulator, current) => accumulator + current.salePrice, 0);
    spanTotalPrice.textContent = sumOfValues; // Seta o valor no carrinho formatado com 2 casas decimais
  } else {
    spanTotalPrice.textContent = 0; // Seta o valor no carrinho.
  }
}

/**
 * Essa função bem simples, esvazia o carrinho de compras
 * quando o usuário clicar no botão "Esvaziar carrinho" e
 * limpa também o localStorage.
 */
function emptyCart() { // Esvazia o carrinho de compras
  const ol = document.querySelector(classNames.CART_ITEMS); // Mapeia a lista de itens
  ol.innerHTML = ''; // Seta o ol com vazio
  localStorage.clear(); // Limpa localStorage
  calculateTotalPrice(); // Recalcula o valor total do carrinho
}

/**
 * A função removeProductFromLocalStorage como o próprio nome
 * diz, remove itens do carrinho, uma pouco mais complexa ela
 * carrega os itens do localStorage, procura por uma expressão
 * regular no item que ela recebeu por parâmetro para extrair
 * o código que começa com "MLB", pois ele é o sku ou "id" que
 * vai ser usado para comparar com os itens salvos e remover do
 * localStorage o item que foi removido do carrinho...
 */
function removeProductFromLocalStorage(item) { // Remove o produto do localStorage
  const savedItems = JSON.parse(localStorage.getItem('productItems')); // Carrega todos os itens do localStorage
  const itemToRemove = item.innerText.match(/MLB(\d+)/g); // Extrai o sku (id) da descrição do item a ser removido atraves de expressão regular
  const skuItemToRemove = itemToRemove.toString(); // Extrai o sku (id) da descrição do item a ser removido
  
  for (let i = 0; i < savedItems.length; i += 1) { // Percorre todos os itens comparando os sku
    if (savedItems[i].sku === skuItemToRemove) { 
      savedItems.splice(i, 1); // Remove o item.
      break; // Interrompe o laço
    }
  }

  localStorage.setItem('productItems', JSON.stringify(savedItems)); // Salva o restante dos itens
  calculateTotalPrice(); // Recalcula o valor total do carrinho
}

/**
 * Essa função cartItemClickListener, remove o item do carrinho, 
 * ao ser clicada ela é invocada, remove o item e também faz a chamada
 * da função para atualizar o localStorage
 */
function cartItemClickListener() { 
  const item = this; // "item" recebe o próprio elemento que foi clicado
  const ol = document.querySelector(classNames.CART_ITEMS); // Mapeia a lista de itens
  ol.removeChild(item); // Remove o item clicado.
  removeProductFromLocalStorage(item); // Chama a função para remover também do localStorage
}

/**
 * Essa função cria o elemento "li", ou "list item", ela trata
 * a descrição do item como: id, nome e o preço do produto.
 */
function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

/**
 * Esta função é a responsável por salvar os itens do carrinho
 * no localStorage, toda vez que um item entra ou sai do carrinho
 * ela e chamada para atualizar os itens.
 */
function saveProductToLocalStorage(item) { // Salva produtos do carrinho para recarregamento da pagina
  const savedItems = localStorage.getItem('productItems'); // Carrega os itens do localStorage
  if (savedItems) { // Se tiver algo no já salvo no localStorage, então junte o novo item e salve
    const itemsToSave = JSON.parse(savedItems); // "Itens para salvar" recebe os itens que estavam salvos no localStorage
    itemsToSave.push(item); // O novo item é adicionado.
    localStorage.setItem('productItems', JSON.stringify(itemsToSave));
  } else { // Senão salva o primeiro item do carrinho
    const firstItemToSaved = [item]; // Salva o item dentro de um array
    localStorage.setItem('productItems', JSON.stringify(firstItemToSaved)); // Grava no localStorage
  }
}

/**
 * addProductToCart por sua vez, também é uma função que faz
 * requisição de dados, mas agora do item que o usuário escolheu
 * colocar no carrinho, então ela faz a requisição a API,
 * trata os dados para serem salvos no localStorage por outra
 * função, e coloca o item no carrinho.
 */
async function addProductToCart() { 
  const item = this.parentNode; // Pega o pai do elemento que chega, considerando que chega o button
  const skuItem = getSkuFromProductItem(item); // Busca pelo "id" ou "sku" do item.
  const itemData = await fetch(`https://api.mercadolibre.com/items/${skuItem}`); // Faz requisição a API com identificação do item
  const itemDataInJson = await itemData.json(); // Transforma os dados da requisição em JSON
  
  const productItem = { // Separa somente os dados necessários do item
    sku: itemDataInJson.id,
    name: itemDataInJson.title,
    salePrice: itemDataInJson.price,
  };
  
  saveProductToLocalStorage(productItem); // Chama a função que salva itens do carrinho no localStorage
  const ol = document.querySelector(classNames.CART_ITEMS); // Mapeia a ol que vai abrigar os itens do carrinho
  ol.appendChild(createCartItemElement(productItem)); // Anexa o item criado (li) na ol
  calculateTotalPrice(); // Recalcula o valor total do carrinho
}

/**
 * Essa função quando invocada, listará todos itens na tela do usuário
 */
function productListing(items) { 
  const sectionItems = document.querySelector(classNames.ITEMS); // Aponta para a section
  const h1Loading = sectionItems.querySelector(classNames.LOADING); // Mapeando o h1 através da sectionItems para economizar o DOM
  sectionItems.removeChild(h1Loading); // Removendo o "loading..." da tela.
  console.log(h1Loading);

  items.forEach((item) => { // Percorre todos os itens adicionando-os a section
    const element = createProductItemElement(item); // Chama a função de criar item passando como parâmetro o elemento atual
    element.querySelector('button').addEventListener('click', addProductToCart); // Adiciona um evento de click já que o botão não tem "onclick"
    sectionItems.appendChild(element); // Anexa o elemento criado a section
  });
}

/**
 * Função responsável por fazer a "carga" dos dados da API
 * através do endpoint fornecido, essa função também trata
 * alguns dados para que sejam passados a frente para outra função
 */
async function getProductAPI() { 
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

/**
 * Função inicial ou "primeira função da aplicação",
 * ela checa se é ou não a primeira vez que o usuário abriu a pagina
 */
function init() { 
  const savedItems = localStorage.getItem('productItems'); // Carrega os itens do localStorage
  if (savedItems) { // Se tiver algo no já salvo no localStorage, então carrega os dados no carrinho
    const itemsToLoad = JSON.parse(savedItems); // "Itens para carregar" recebe os dados do localStorage
    const ol = document.querySelector(classNames.CART_ITEMS); // Mapeia a ol que vai abrigar os itens do carrinho (fora do forEach pois a leitura do DOM é "caro")
    
    itemsToLoad.forEach((item) => { // Percorre todos itens do array
      ol.appendChild(createCartItemElement(item)); // Cria o tem e anexa o item criado na ol     
    });
    
    calculateTotalPrice(); // Recalcula o valor total do carrinho
    getProductAPI(); // Chama a função que faz a carga dos dados.
  } else { // Senão começa tudo do 0
    getProductAPI(); // Chama a função que faz a carga dos dados.
    emptyCart(); // Para garantir que o carrinho começará vazio, limpe-o.
  }
}

/**
 * "Start" da aplicação, garante que após todos os
 * elementos HTML forem carregados as funções iniciam
 */
window.onload = () => {
  init();
};
